import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';

// GET /api/moderation/logs/[contentId] - Get moderation logs for specific content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để xem log kiểm duyệt' },
        { status: 401 }
      );
    }

    const { contentId } = await params;
    const user = authResult.user;

    // Check if user has permission to view logs (moderator/admin or content author)
    const isModerator = ['moderator', 'admin'].includes(user.role);
    
    if (!isModerator) {
      // Check if user is the author of this content (check both places and place_drafts)
      let contentDoc = await adminDb.collection('places').doc(contentId).get();
      if (!contentDoc.exists) {
        contentDoc = await adminDb.collection('place_drafts').doc(contentId).get();
      }
      
      if (!contentDoc.exists || contentDoc.data()?.createdBy !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Bạn không có quyền xem log kiểm duyệt' },
          { status: 403 }
        );
      }
    }

    const allLogs = [];

    // 1. Get official moderation logs
    const logsSnapshot = await adminDb
      .collection('moderation_logs')
      .where('contentId', '==', contentId)
      .orderBy('timestamp', 'desc')
      .get();

    for (const doc of logsSnapshot.docs) {
      const logData = doc.data();
      
      // Get moderator info
      let moderatorData = null;
      if (logData.moderatorId) {
        const moderatorDoc = await adminDb.collection('users').doc(logData.moderatorId).get();
        moderatorData = moderatorDoc.data();
      }
      
      // Follow Audit Log Structure from documentation
      allLogs.push({
        id: doc.id,
        timestamp: logData.timestamp,
        action_type: logData.action,
        actor: {
          user_id: logData.moderatorId,
          role: moderatorData?.role || 'moderator',
          ip: logData.ip || null,
          fullName: moderatorData?.fullName || null,
          avatar: moderatorData?.avatar || null
        },
        target: {
          place_id: contentId,
          version: logData.version || 1
        },
        changes: {
          before: { status: logData.oldStatus },
          after: { status: logData.newStatus }
        },
        metadata: {
          reason: logData.reason || null,
          notes: logData.reviewNotes || null,
          system_generated: false,
          ...logData.metadata
        },
        // Keep backward compatibility fields
        source: 'moderation_logs',
        action: logData.action,
        moderatorId: logData.moderatorId,
        moderator: moderatorData ? {
          id: logData.moderatorId,
          fullName: moderatorData.fullName,
          role: moderatorData.role,
          avatar: moderatorData.avatar
        } : null,
        reviewNotes: logData.reviewNotes,
        oldStatus: logData.oldStatus,
        newStatus: logData.newStatus
      });
    }

    // 2. Get content creation and update history from the place itself
    let contentDoc = await adminDb.collection('places').doc(contentId).get();
    let isFromDrafts = false;
    
    if (!contentDoc.exists) {
      contentDoc = await adminDb.collection('place_drafts').doc(contentId).get();
      isFromDrafts = true;
    }
    
    if (contentDoc.exists) {
      const placeData = contentDoc.data();
      
      // Get author info
      let authorData = null;
      if (placeData.createdBy) {
        const authorDoc = await adminDb.collection('users').doc(placeData.createdBy).get();
        authorData = authorDoc.data();
      }
      
      // Add creation log if not exists in moderation logs
      if (placeData.createdAt) {
        const hasCreationLog = allLogs.some(log => log.action === 'created');
        if (!hasCreationLog) {
          // Follow Audit Log Structure
          allLogs.push({
            id: `creation-${contentId}`,
            timestamp: placeData.createdAt,
            action_type: 'created',
            actor: {
              user_id: placeData.createdBy,
              role: authorData?.role || 'contributor',
              ip: null,
              fullName: authorData?.fullName || null,
              avatar: authorData?.avatar || null
            },
            target: {
              place_id: contentId,
              version: 1
            },
            changes: {
              before: null,
              after: { status: 'draft', name: placeData.name }
            },
            metadata: {
              reason: null,
              notes: 'Địa điểm được tạo mới',
              system_generated: true,
              isFromDrafts,
              collection: isFromDrafts ? 'place_drafts' : 'places'
            },
            // Backward compatibility
            source: 'place_data',
            action: 'created',
            userId: placeData.createdBy,
            userName: authorData?.fullName,
            userRole: authorData?.role
          });
        }
      }
      
      // Add edit creation log for edit drafts
      if (placeData.editCreatedAt && placeData.isEditingPublished) {
        // Follow Audit Log Structure
        allLogs.push({
          id: `edit-creation-${contentId}`,
          timestamp: placeData.editCreatedAt,
          action_type: 'edit_draft_created',
          actor: {
            user_id: placeData.createdBy,
            role: authorData?.role || 'contributor',
            ip: null,
            fullName: authorData?.fullName || null,
            avatar: authorData?.avatar || null
          },
          target: {
            place_id: contentId,
            version: (placeData.version || 1) + 1
          },
          changes: {
            before: null,
            after: { status: 'draft', editing_published: true }
          },
          metadata: {
            reason: null,
            notes: 'Tạo bản chỉnh sửa từ địa điểm đã xuất bản',
            system_generated: false,
            originalPlaceId: placeData.originalPlaceId,
            isEditRequest: true
          },
          // Backward compatibility
          source: 'place_data',
          action: 'edit_draft_created',
          userId: placeData.createdBy,
          userName: authorData?.fullName,
          userRole: authorData?.role
        });
      }
      
      // Add submission logs based on status transitions
      if (placeData.updatedAt && placeData.status) {
        const statusActionMap = {
          'submitted': 'submitted',
          'in_review': 'started_review',
          'published': 'published',
          'rejected': 'rejected',
          'pending_edit': 'edit_submitted'
        };
        
        const action = statusActionMap[placeData.status];
        if (action) {
          const hasStatusLog = allLogs.some(log => log.action === action);
          if (!hasStatusLog) {
            allLogs.push({
              id: `status-${placeData.status}-${contentId}`,
              source: 'place_data',
              action,
              userId: placeData.createdBy,
              userName: authorData?.fullName,
              userRole: authorData?.role,
              timestamp: placeData.updatedAt,
              metadata: {
                status: placeData.status,
                trustLabel: placeData.trustLabel
              }
            });
          }
        }
      }
      
      // Add published timestamp if available
      if (placeData.publishedAt && placeData.status === 'published') {
        const hasPublishLog = allLogs.some(log => log.action === 'published');
        if (!hasPublishLog) {
          allLogs.push({
            id: `published-${contentId}`,
            source: 'place_data',
            action: 'published',
            timestamp: placeData.publishedAt,
            metadata: {
              trustLabel: placeData.trustLabel
            }
          });
        }
      }
    }

    // 3. Get moderation queue history for this content
    const queueSnapshot = await adminDb
      .collection('moderation_queue')
      .where('contentId', '==', contentId)
      .get();

    // Also check for edit requests by itemId
    const editQueueSnapshot = await adminDb
      .collection('moderation_queue')
      .where('itemId', '==', contentId)
      .where('itemType', '==', 'place_edit')
      .get();

    const processQueueEntry = (doc) => {
      const queueData = doc.data();
      return {
        id: `queue-${doc.id}`,
        source: 'moderation_queue',
        action: queueData.action === 'edit_review' ? 'edit_submitted' : 'submitted_to_queue',
        userId: queueData.submittedBy,
        timestamp: queueData.submittedAt,
        metadata: {
          queueType: queueData.queueType,
          priority: queueData.priority,
          status: queueData.status,
          isEditRequest: queueData.itemType === 'place_edit'
        }
      };
    };

    queueSnapshot.docs.forEach(doc => {
      allLogs.push(processQueueEntry(doc));
    });

    editQueueSnapshot.docs.forEach(doc => {
      allLogs.push(processQueueEntry(doc));
    });

    // Sort all logs by timestamp (most recent first)
    const sortedLogs = allLogs.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampB - timestampA;
    });

    return NextResponse.json({
      success: true,
      data: sortedLogs
    });

  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải log kiểm duyệt' },
      { status: 500 }
    );
  }
}