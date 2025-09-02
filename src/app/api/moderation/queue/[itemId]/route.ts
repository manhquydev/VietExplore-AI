import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { FieldValue } from 'firebase-admin/firestore';
import { EnhancedNotificationService } from '@/lib/server/enhanced-notification-service';
import { CacheService } from '@/lib/server/cache-service';
import { VersioningService } from '@/lib/server/versioning-service';
import { SoftDeleteService } from '@/lib/server/soft-delete-service';

// GET /api/moderation/queue/[itemId] - Get moderation item details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem chi tiết kiểm duyệt' },
        { status: 403 }
      );
    }

    const { itemId } = await params;

    // Get moderation item
    const itemDoc = await adminDb.collection('moderation_queue').doc(itemId).get();
    if (!itemDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục cần duyệt' },
        { status: 404 }
      );
    }

    const itemData = itemDoc.data();
    
    // Get content details
    let contentDetails = null;
    if (itemData!.contentType === 'place' || itemData!.itemType === 'place_edit' || itemData!.itemType === 'place_deletion') {
      const contentId = itemData!.contentId || itemData!.itemId;
      const placeDoc = await adminDb.collection('places').doc(contentId).get();
      contentDetails = placeDoc.exists ? placeDoc.data() : null;
    }

    // Get submitter info
    const submitterDoc = await adminDb.collection('users').doc(itemData!.submittedBy).get();
    const submitterData = submitterDoc.exists ? submitterDoc.data() : null;

    // Get reviewer info if exists
    let reviewerData = null;
    if (itemData!.reviewedBy) {
      const reviewerDoc = await adminDb.collection('users').doc(itemData!.reviewedBy).get();
      reviewerData = reviewerDoc.exists ? reviewerDoc.data() : null;
    }

    const result = {
      id: itemDoc.id,
      ...itemData,
      submitter: submitterData ? {
        id: itemData!.submittedBy,
        fullName: submitterData.fullName,
        email: submitterData.email,
        role: submitterData.role
      } : null,
      reviewer: reviewerData ? {
        id: itemData!.reviewedBy,
        fullName: reviewerData.fullName,
        email: reviewerData.email,
        role: reviewerData.role
      } : null,
      contentDetails
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching moderation item:', error);
    return NextResponse.json(
      { error: 'Không thể tải chi tiết kiểm duyệt' },
      { status: 500 }
    );
  }
}

// PATCH /api/moderation/queue/[itemId] - Claim moderation item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền nhận việc kiểm duyệt' },
        { status: 403 }
      );
    }

    const { itemId } = await params;
    const moderator = authResult.user;
    const { action } = await request.json();

    if (action === 'claim') {
      // Get moderation item
      const itemDoc = await adminDb.collection('moderation_queue').doc(itemId).get();
      if (!itemDoc.exists) {
        return NextResponse.json(
          { error: 'Không tìm thấy mục cần duyệt' },
          { status: 404 }
        );
      }

      const itemData = itemDoc.data();

      // Check if already claimed by another moderator
      if (itemData!.claimedBy && itemData!.claimedBy !== moderator.id) {
        const claimExpiresAt = new Date(itemData!.claimExpiresAt);
        if (claimExpiresAt > new Date()) {
          return NextResponse.json(
            { error: 'Mục này đã được một kiểm duyệt viên khác nhận' },
            { status: 409 }
          );
        }
      }

      const now = new Date();
      const claimExpiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      // Claim the item using transaction to prevent race conditions
      await adminDb.runTransaction(async (transaction) => {
        const itemRef = adminDb.collection('moderation_queue').doc(itemId);
        const itemDoc = await transaction.get(itemRef);
        
        if (!itemDoc.exists) {
          throw new Error('Item not found');
        }

        const data = itemDoc.data();
        
        // Double-check claim status in transaction
        if (data!.claimedBy && data!.claimedBy !== moderator.id) {
          const expiry = new Date(data!.claimExpiresAt);
          if (expiry > new Date()) {
            throw new Error('Already claimed');
          }
        }

        transaction.update(itemRef, {
          status: 'claimed',
          claimedBy: moderator.id,
          claimedAt: now.toISOString(),
          claimExpiresAt: claimExpiresAt.toISOString(),
          updatedAt: now.toISOString()
        });
      });

      // Notify other moderators that item was claimed (optional)
      // This helps prevent multiple moderators from trying to claim the same item
      // EnhancedNotificationService.notifyModerators(
      //   'moderation_claimed',
      //   'Mục kiểm duyệt đã được nhận',
      //   `${moderator.fullName} đã nhận mục kiểm duyệt`,
      //   { itemId, claimedBy: moderator.fullName }
      // );

      return NextResponse.json({
        success: true,
        message: 'Đã nhận mục kiểm duyệt thành công',
        data: {
          itemId,
          claimedBy: moderator.id,
          claimedAt: now.toISOString(),
          expiresAt: claimExpiresAt.toISOString()
        }
      });

    } else if (action === 'release') {
      // Release the claim
      await adminDb.collection('moderation_queue').doc(itemId).update({
        status: 'pending',
        claimedBy: FieldValue.delete(),
        claimedAt: FieldValue.delete(),
        claimExpiresAt: FieldValue.delete(),
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        message: 'Đã bỏ nhận mục kiểm duyệt'
      });
    }

    return NextResponse.json(
      { error: 'Hành động không hợp lệ' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error claiming moderation item:', error);
    
    if (error.message === 'Already claimed') {
      return NextResponse.json(
        { error: 'Mục này đã được một kiểm duyệt viên khác nhận' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Không thể nhận mục kiểm duyệt' },
      { status: 500 }
    );
  }
}

// PUT /api/moderation/queue/[itemId] - Review moderation item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || !['moderator', 'admin'].includes(authResult.user.role)) {
      return NextResponse.json(
        { error: 'Bạn không có quyền duyệt nội dung' },
        { status: 403 }
      );
    }

    const { itemId } = await params;
    const moderator = authResult.user;
    const { action, reviewNotes, newTrustLabel } = await request.json();

    // Validate action - thêm request_edit và direct_delete theo tài liệu 2.2.2
    if (!['approve', 'reject', 'escalate', 'start_review', 'request_edit', 'direct_delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    // Get moderation item
    const itemDoc = await adminDb.collection('moderation_queue').doc(itemId).get();
    if (!itemDoc.exists) {
      return NextResponse.json(
        { error: 'Không tìm thấy mục cần duyệt' },
        { status: 404 }
      );
    }

    const itemData = itemDoc.data();
    
    // Check claim requirement - theo quy trình tài liệu mục 2.2.1
    if (moderator.role !== 'admin') {
      // Items with status 'pending' must be claimed first before processing
      if (itemData!.status === 'pending' && !itemData!.claimedBy) {
        return NextResponse.json(
          { error: 'Cần tiếp nhận địa điểm trước khi xử lý' },
          { status: 403 }
        );
      }
      
      // Check if item is claimed by another moderator
      if (itemData!.claimedBy && itemData!.claimedBy !== moderator.id) {
        return NextResponse.json(
          { error: 'Mục này đã được một kiểm duyệt viên khác nhận' },
          { status: 403 }
        );
      }
      
      // Check if claim has expired
      if (itemData!.claimedBy === moderator.id && itemData!.claimExpiresAt) {
        const claimExpiry = new Date(itemData!.claimExpiresAt);
        if (claimExpiry < new Date()) {
          return NextResponse.json(
            { error: 'Quyền nhận mục kiểm duyệt đã hết hạn' },
            { status: 403 }
          );
        }
      }
    }
    
    const now = new Date().toISOString();

    // Update moderation item - theo tài liệu 2.2.2
    const updateData: any = {
      status: action === 'escalate' ? 'escalated' : 
              action === 'approve' ? 'approved' : 
              action === 'start_review' ? 'in_review' : 
              action === 'request_edit' ? 'needs_revision' :
              action === 'direct_delete' ? 'deleted' : 'rejected',
      reviewedBy: moderator.id,
      reviewedAt: now,
      reviewNotes: reviewNotes || ''
    };

    // Add action to handle "start_review" to mark content as in_review
    if (action === 'start_review') {
      updateData.status = 'in_review';
    }

    if (action === 'escalate') {
      updateData.escalatedTo = 'admin'; // Escalate to admin
      updateData.escalatedAt = now;
      updateData.escalationReason = reviewNotes;
    }

    await adminDb.collection('moderation_queue').doc(itemId).update(updateData);

    // Update the actual content based on action and item type
    if (itemData!.contentType === 'place' || itemData!.itemType === 'place_edit' || itemData!.itemType === 'place_deletion') {
      const contentId = itemData!.contentId || itemData!.itemId;
      const placeUpdate: any = {
        updatedAt: now,
        moderatedBy: moderator.id
      };

      if (action === 'start_review') {
        placeUpdate.status = 'in_review';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'started_review',
          moderatorId: moderator.id,
          reason: reviewNotes || 'Bắt đầu kiểm duyệt',
          createdAt: now
        });
        
      } else if (action === 'approve') {
        // Handle different approval cases based on item type
        if (itemData!.itemType === 'place_edit') {
          // For edit requests, use VersioningService theo tài liệu 2.3.1
          const editDraftId = itemData!.metadata?.editDraftId;
          const versionId = itemData!.metadata?.versionId;
          
          if (versionId) {
            // Use versioning system - approve version
            const versionResult = await VersioningService.approveVersion(
              versionId, 
              moderator.id, 
              reviewNotes || 'Chỉnh sửa được phê duyệt'
            );
            
            if (!versionResult.success) {
              return NextResponse.json(
                { error: `Không thể phê duyệt version: ${versionResult.error}` },
                { status: 500 }
              );
            }
            
            // Version service đã update place gốc, chỉ cần cleanup draft
            if (editDraftId) {
              await adminDb.collection('place_drafts').doc(editDraftId).delete();
            }
            
            // Skip normal placeUpdate logic vì version service đã xử lý
            placeUpdate = {};
            
          } else if (editDraftId) {
            // Fallback cho legacy system
            const editDraftDoc = await adminDb.collection('place_drafts').doc(editDraftId).get();
            if (editDraftDoc.exists) {
              const editData = editDraftDoc.data();
              placeUpdate = {
                ...editData,
                id: contentId,
                status: 'published',
                publishedAt: editData.publishedAt || placeUpdate.publishedAt,
                updatedAt: now,
                moderatedBy: moderator.id,
                editApprovedAt: now,
                editApprovedBy: moderator.id,
                hasEditingVersion: false,
                editingVersionId: null,
                isEditingPublished: undefined,
                originalPlaceId: undefined,
                originalData: undefined,
                editCreatedAt: undefined
              };
              
              await adminDb.collection('place_drafts').doc(editDraftId).delete();
            }
          }
          
          placeUpdate.status = 'published';
        } else if (itemData!.itemType === 'place_deletion') {
          // Use SoftDeleteService để approve deletion theo tài liệu 2.4.1
          const deletionRequestId = itemData!.metadata?.deletionRequestId;
          
          if (deletionRequestId) {
            const deletionResult = await SoftDeleteService.reviewDeletionRequest(
              deletionRequestId,
              moderator.id,
              'approve',
              reviewNotes || 'Phê duyệt xóa địa điểm'
            );
            
            if (!deletionResult.success) {
              return NextResponse.json(
                { error: `Không thể phê duyệt xóa: ${deletionResult.error}` },
                { status: 500 }
              );
            }
            
            // Soft delete service đã xử lý, skip normal update
            placeUpdate = {};
            
          } else {
            // Fallback cho legacy system
            placeUpdate.status = 'hidden';
            placeUpdate.deletedAt = now;
            placeUpdate.deletedBy = moderator.id;
            placeUpdate.deletionReason = itemData!.metadata?.reason || 'User requested deletion';
            placeUpdate.deleted = true;
            placeUpdate.isVisibleToPublic = false;
          }
          
          // Trigger cache invalidation for removed place
          const placeDocForCache = await adminDb.collection('places').doc(contentId).get();
          const placeData = placeDocForCache.exists ? placeDocForCache.data() : null;
          if (placeData) {
            await CacheService.revalidatePlaceRemoval({
              id: contentId,
              slug: placeData.slug,
              region: placeData.region,
              province: placeData.province,
              type: placeData.type
            });
          }
        } else {
          // Regular place approval
          placeUpdate.status = 'published';
          placeUpdate.publishedAt = now;
        }
        
        // Update trust label if provided (only for new place submissions)
        if (newTrustLabel && ['community', 'contributor', 'partner', 'verified', 'special_verified'].includes(newTrustLabel)) {
          placeUpdate.trustLabel = newTrustLabel;
        } else if (!itemData!.itemType || itemData!.itemType === 'place_submission') {
          // Auto-assign trust label based on content quality and submitter role
          const submitterRole = itemData!.submitter?.role || 'traveler';
          let assignedTrustLabel = 'community'; // Default
          
          if (submitterRole === 'contributor') {
            assignedTrustLabel = 'contributor';
          } else if (submitterRole === 'partner') {
            assignedTrustLabel = 'partner';
          }
          
          // Moderator can upgrade trust label based on content quality
          if (moderator.role === 'admin' && reviewNotes?.includes('[VERIFIED]')) {
            assignedTrustLabel = 'verified';
          } else if (moderator.role === 'admin' && reviewNotes?.includes('[SPECIAL_VERIFIED]')) {
            assignedTrustLabel = 'special_verified';
          }
          
          placeUpdate.trustLabel = assignedTrustLabel;
        }
        
        // Add to moderation history
        const approvalAction = itemData!.itemType === 'place_edit' ? 'edit_approved' : 
                               itemData!.itemType === 'place_deletion' ? 'deletion_approved' : 'approved';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: approvalAction,
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });

      } else if (action === 'reject') {
        // Handle different rejection cases based on item type
        if (itemData!.itemType === 'place_edit') {
          // For edit requests, use VersioningService để reject version
          const editDraftId = itemData!.metadata?.editDraftId;
          const versionId = itemData!.metadata?.versionId;
          
          if (versionId) {
            // Use versioning system - reject version
            const versionResult = await VersioningService.rejectVersion(
              versionId,
              moderator.id,
              reviewNotes || 'Chỉnh sửa bị từ chối'
            );
            
            if (!versionResult.success) {
              return NextResponse.json(
                { error: `Không thể từ chối version: ${versionResult.error}` },
                { status: 500 }
              );
            }
            
            // Cleanup draft
            if (editDraftId) {
              await adminDb.collection('place_drafts').doc(editDraftId).delete();
            }
            
            placeUpdate = {}; // Version service đã xử lý
            
          } else if (editDraftId) {
            // Fallback cho legacy system
            await adminDb.collection('place_drafts').doc(editDraftId).delete();
            placeUpdate.status = 'published';
            placeUpdate.hasEditingVersion = false;
            placeUpdate.editingVersionId = null;
          }
          
          placeUpdate.editRejectedAt = now;
          placeUpdate.editRejectedBy = moderator.id;
          placeUpdate.editRejectionReason = reviewNotes || 'Chỉnh sửa bị từ chối';
        } else if (itemData!.itemType === 'place_deletion') {
          // Use SoftDeleteService để reject deletion
          const deletionRequestId = itemData!.metadata?.deletionRequestId;
          
          if (deletionRequestId) {
            const deletionResult = await SoftDeleteService.reviewDeletionRequest(
              deletionRequestId,
              moderator.id,
              'reject',
              reviewNotes || 'Từ chối xóa địa điểm'
            );
            
            if (!deletionResult.success) {
              return NextResponse.json(
                { error: `Không thể từ chối xóa: ${deletionResult.error}` },
                { status: 500 }
              );
            }
            
            // Service đã xử lý, skip normal update
            placeUpdate = {};
            
          } else {
            // Fallback: restore to published
            placeUpdate.status = 'published';
          }
        } else {
          // Regular place rejection
          placeUpdate.status = 'rejected';
          placeUpdate.rejectedAt = now;
          placeUpdate.rejectionReason = reviewNotes || 'Không rõ lý do';
        }
        
        // Add to moderation history
        const rejectionAction = itemData!.itemType === 'place_edit' ? 'edit_rejected' : 
                                itemData!.itemType === 'place_deletion' ? 'deletion_rejected' : 'rejected';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: rejectionAction,
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });
        
      } else if (action === 'escalate') {
        // For escalated items, keep status as in_review but add escalation info
        placeUpdate.status = 'in_review';
        placeUpdate.escalatedAt = now;
        placeUpdate.escalatedBy = moderator.id;
        placeUpdate.escalationReason = reviewNotes || 'Chuyển lên cấp cao hơn';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'escalated',
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });
        
      } else if (action === 'request_edit') {
        // Yêu cầu chỉnh sửa - theo tài liệu 2.2.2 (b)
        placeUpdate.status = 'needs_revision';
        placeUpdate.revisionRequestedAt = now;
        placeUpdate.revisionRequestedBy = moderator.id;
        placeUpdate.revisionNotes = reviewNotes || 'Cần chỉnh sửa theo yêu cầu';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'revision_requested',
          moderatorId: moderator.id,
          reason: reviewNotes || '',
          createdAt: now
        });
        
      } else if (action === 'direct_delete') {
        // Direct delete by moderator/admin - theo tài liệu mục 4.1.1 và 4.2.1
        if (!['moderator', 'admin'].includes(moderator.role)) {
          return NextResponse.json(
            { error: 'Chỉ Moderator/Admin mới có quyền xóa trực tiếp' },
            { status: 403 }
          );
        }
        
        placeUpdate.status = 'hidden';
        placeUpdate.deletedAt = now;
        placeUpdate.deletedBy = moderator.id;
        placeUpdate.deletionReason = reviewNotes || 'Xóa bởi kiểm duyệt viên';
        placeUpdate.deletionType = 'direct_moderation';
        placeUpdate.moderationHistory = FieldValue.arrayUnion({
          action: 'direct_deleted',
          moderatorId: moderator.id,
          reason: reviewNotes || 'Xóa trực tiếp bởi kiểm duyệt viên',
          createdAt: now
        });
        
        // Log critical action for audit trail
        const placeDocForAudit = await adminDb.collection('places').doc(contentId).get();
        console.log(`CRITICAL: Direct delete by ${moderator.role} ${moderator.id} on place ${contentId}`, {
          moderator: { id: moderator.id, role: moderator.role, email: moderator.email },
          place: { id: contentId, name: placeDocForAudit.exists ? placeDocForAudit.data()?.name : 'Unknown' },
          reason: reviewNotes,
          timestamp: now
        });
      }

      // Check if the place document exists before updating
      const placeDoc = await adminDb.collection('places').doc(contentId).get();
      if (!placeDoc.exists) {
        console.warn(`Place document ${contentId} not found, cleaning up moderation queue entry`);
        
        // Clean up the orphaned moderation queue entry
        await adminDb.collection('moderation_queue').doc(itemId).delete();
        
        // Also log this cleanup action
        await adminDb.collection('moderation_logs').add({
          moderationItemId: itemId,
          contentType: itemData!.contentType || itemData!.itemType,
          contentId: contentId,
          action: 'cleanup_orphaned',
          moderatorId: moderator.id,
          reviewNotes: 'Tự động xóa mục kiểm duyệt do nội dung gốc đã bị xóa',
          timestamp: now
        });
        
        return NextResponse.json({
          success: true,
          message: 'Nội dung đã bị xóa. Đã tự động dọn dẹp mục kiểm duyệt.',
          action: 'cleaned_up'
        });
      }

      await adminDb.collection('places').doc(contentId).update(placeUpdate);

      // Update user stats and send notifications
      if (action === 'approve') {
        const placeData = placeDoc.data();
        
        if (placeData?.createdBy) {
          await adminDb.collection('users').doc(placeData.createdBy).update({
            'stats.placesPublished': FieldValue.increment(1),
            updatedAt: now
          });

          // Send approval notification to submitter
          if (itemData!.itemType === 'place_edit') {
            await EnhancedNotificationService.notifyEditSubmitter(
              placeData.createdBy,
              contentId,
              placeData.name || 'Địa điểm',
              'approved',
              reviewNotes
            );
          } else {
            await EnhancedNotificationService.notifyPlaceSubmitter(
              placeData.createdBy,
              contentId,
              placeData.name || 'Địa điểm',
              'approved',
              reviewNotes
            );
          }

          // Trigger cache revalidation for approved content
          await CacheService.revalidatePlaceApproval({
            id: contentId,
            slug: placeData.slug,
            region: placeData.region,
            province: placeData.province,
            type: placeData.type,
            featured: placeData.featured
          });
        }
      } else if (action === 'reject') {
        // Send rejection notification to submitter
        const placeData = placeDoc.data();
        if (placeData?.createdBy) {
          if (itemData!.itemType === 'place_edit') {
            await EnhancedNotificationService.notifyEditSubmitter(
              placeData.createdBy,
              contentId,
              placeData.name || 'Địa điểm',
              'rejected',
              reviewNotes
            );
          } else {
            await EnhancedNotificationService.notifyPlaceSubmitter(
              placeData.createdBy,
              contentId,
              placeData.name || 'Địa điểm',
              'rejected',
              reviewNotes
            );
          }
        }
      } else if (action === 'escalate') {
        // Send escalation notification to admins
        await EnhancedNotificationService.notifyEscalation(
          itemId,
          itemData!.itemType || itemData!.contentType,
          moderator.fullName || moderator.email,
          reviewNotes || 'Không có lý do cụ thể'
        );
      }
    }

    // Log the moderation action
    await adminDb.collection('moderation_logs').add({
      moderationItemId: itemId,
      contentType: itemData!.contentType || itemData!.itemType,
      contentId: itemData!.contentId || itemData!.itemId,
      action,
      moderatorId: moderator.id,
      reviewNotes: reviewNotes || '',
      timestamp: now
    });

    const messages = {
      'approve': 'Nội dung đã được phê duyệt',
      'reject': 'Nội dung đã bị từ chối',
      'escalate': 'Nội dung đã được chuyển lên cấp cao hơn',
      'start_review': 'Đã bắt đầu quá trình kiểm duyệt',
      'request_edit': 'Đã yêu cầu chỉnh sửa nội dung',
      'direct_delete': 'Đã xóa nội dung trực tiếp'
    };

    return NextResponse.json({
      success: true,
      message: messages[action as keyof typeof messages] || 'Đã xử lý thành công',
      data: {
        itemId: itemId,
        action,
        reviewedBy: moderator.fullName,
        reviewedAt: now
      }
    });

  } catch (error: any) {
    console.error('Error reviewing moderation item:', error);
    
    // More detailed error logging
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      itemId,
      action,
      moderator: moderator?.id
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || 'Không thể xử lý yêu cầu duyệt'
      },
      { status: 500 }
    );
  }
}
