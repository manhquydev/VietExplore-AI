import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { RealtimeService } from '@/lib/firebase/realtime';
import { EnhancedNotificationService } from '@/lib/server/enhanced-notification-service';

// POST /api/admin/reports/[reportId]/resolve-with-action
// Resolve report + Execute action on place (atomic operation)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const authResult = await verifyAuthToken(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Bạn cần đăng nhập để thực hiện hành động này' },
        { status: 401 }
      );
    }

    const user = authResult.user;
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thực hiện hành động này' },
        { status: 403 }
      );
    }

    const { reportId } = await params;
    const body = await request.json();
    const { action, notes } = body;

    if (!action || !action.type || !action.notes) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin hành động hoặc ghi chú' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['request_edit', 'suspend', 'hide_permanent', 'warning_only'];
    if (!validActions.includes(action.type)) {
      return NextResponse.json(
        { success: false, error: 'Loại hành động không hợp lệ' },
        { status: 400 }
      );
    }

    console.log(`[RESOLVE-WITH-ACTION] Starting for report ${reportId}, action: ${action.type}`);

    // Get report document
    const reportDoc = await adminDb.collection('place_reports').doc(reportId).get();
    if (!reportDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy báo cáo' },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    const placeId = reportData?.placeId;

    if (!placeId) {
      return NextResponse.json(
        { success: false, error: 'Báo cáo không có thông tin địa điểm' },
        { status: 400 }
      );
    }

    // Get place document
    const placeDoc = await adminDb.collection('places').doc(placeId).get();
    if (!placeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy địa điểm' },
        { status: 404 }
      );
    }

    const placeData = placeDoc.data();
    const now = new Date().toISOString();

    // START TRANSACTION - Atomic operation
    try {
      // Step 1: Update report status to resolved
      await adminDb.collection('place_reports').doc(reportId).update({
        status: 'resolved',
        reviewedBy: user.id,
        reviewedAt: now,
        reviewNotes: action.notes,
        updatedAt: now,
        resolutionAction: action.type,
        resolutionData: {
          type: action.type,
          executedAt: now,
          executedBy: user.id,
          ...(action.suspendDuration && { suspendDuration: action.suspendDuration })
        }
      });

      console.log(`[RESOLVE-WITH-ACTION] Report ${reportId} marked as resolved`);

      // Step 2: Execute action on place based on type
      let placeActionResult: any = {};

      switch (action.type) {
        case 'request_edit':
          placeActionResult = await executeRequestEditAction(
            adminDb,
            placeId,
            placeData,
            reportId,
            action.notes,
            user
          );
          break;

        case 'suspend':
          if (!action.suspendDuration || action.suspendDuration < 1 || action.suspendDuration > 168) {
            throw new Error('Thời gian đình chỉ không hợp lệ (1-168 giờ)');
          }
          placeActionResult = await executeSuspendAction(
            adminDb,
            placeId,
            placeData,
            reportId,
            action.notes,
            action.suspendDuration,
            user
          );
          break;

        case 'hide_permanent':
          placeActionResult = await executeHidePermanentAction(
            adminDb,
            placeId,
            placeData,
            reportId,
            action.notes,
            user
          );
          break;

        case 'warning_only':
          placeActionResult = await executeWarningOnlyAction(
            adminDb,
            placeId,
            placeData,
            reportId,
            action.notes,
            user
          );
          break;

        default:
          throw new Error(`Hành động không được hỗ trợ: ${action.type}`);
      }

      // Step 3: Create moderation log
      await adminDb.collection('moderation_logs').add({
        action: 'report_resolved_with_action',
        reportId,
        placeId,
        placeName: placeData?.name,
        reportType: reportData?.reportType,
        moderatorId: user.id,
        moderatorInfo: {
          id: user.id,
          name: user.fullName || user.email,
          email: user.email,
          role: user.role
        },
        performedAt: now,
        notes: action.notes,
        oldReportStatus: reportData?.status,
        newReportStatus: 'resolved',
        placeAction: {
          type: action.type,
          ...placeActionResult
        }
      });

      // Step 4: Update realtime report stats
      try {
        await RealtimeService.updateReportStatusStats(reportData?.status, 'resolved');
      } catch (error) {
        console.error('[RESOLVE-WITH-ACTION] Failed to update realtime stats:', error);
        // Don't fail the request if realtime update fails
      }

      console.log(`[RESOLVE-WITH-ACTION] Successfully completed for report ${reportId}`);

      return NextResponse.json({
        success: true,
        message: `Báo cáo đã được giải quyết và ${getActionMessage(action.type)}`,
        data: {
          reportId,
          placeId,
          action: action.type,
          placeActionResult
        }
      });

    } catch (error: any) {
      console.error('[RESOLVE-WITH-ACTION] Transaction failed:', error);

      // Rollback attempt - mark report as failed
      try {
        await adminDb.collection('place_reports').doc(reportId).update({
          resolutionError: error.message,
          resolutionFailedAt: now
        });
      } catch (rollbackError) {
        console.error('[RESOLVE-WITH-ACTION] Rollback failed:', rollbackError);
      }

      throw error;
    }

  } catch (error: any) {
    console.error('[RESOLVE-WITH-ACTION] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Không thể giải quyết báo cáo' },
      { status: 500 }
    );
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function executeRequestEditAction(
  adminDb: FirebaseFirestore.Firestore,
  placeId: string,
  placeData: any,
  reportId: string,
  notes: string,
  user: any
) {
  const now = new Date().toISOString();

  // Update place status to needs_revision
  await adminDb.collection('places').doc(placeId).update({
    status: 'needs_revision',
    revisionRequestedAt: now,
    revisionRequestedBy: user.id,
    revisionNotes: notes,
    updatedAt: now
  });

  // Create moderation_queue entry for tracking
  const queueEntry = await adminDb.collection('moderation_queue').add({
    itemType: 'place_edit_request',
    contentType: 'place',
    contentId: placeId,
    itemId: placeId,
    status: 'pending',
    priority: 'medium',
    queueType: 'contributor_queue',
    submittedBy: 'system',
    submittedAt: now,
    metadata: {
      reason: notes,
      reportId: reportId,
      requestedBy: user.id,
      originalStatus: placeData?.status
    }
  });

  // Send notification to owner
  try {
    await EnhancedNotificationService.notifyRevisionRequested(
      placeId,
      placeData?.name || 'Unknown',
      placeData?.createdBy,
      notes
    );
  } catch (error) {
    console.error('[REQUEST-EDIT] Failed to send notification:', error);
  }

  console.log(`[REQUEST-EDIT] Place ${placeId} marked as needs_revision, queue entry: ${queueEntry.id}`);

  return {
    oldStatus: placeData?.status,
    newStatus: 'needs_revision',
    queueEntryId: queueEntry.id
  };
}

async function executeSuspendAction(
  adminDb: FirebaseFirestore.Firestore,
  placeId: string,
  placeData: any,
  reportId: string,
  notes: string,
  duration: number,
  user: any
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

  // Update place to suspended status
  await adminDb.collection('places').doc(placeId).update({
    status: 'temporarily_suspended',
    suspendedAt: now.toISOString(),
    suspendedBy: user.id,
    suspensionReason: notes,
    suspensionExpiresAt: expiresAt.toISOString(),
    suspensionType: 'investigation',
    updatedAt: now.toISOString(),
    moderatedBy: user.id
  });

  // Schedule auto-unsuspension
  await adminDb.collection('suspension_schedules').add({
    placeId,
    expiresAt: expiresAt.toISOString(),
    processed: false,
    createdAt: now.toISOString(),
    reportId
  });

  // Send notification to owner
  try {
    await EnhancedNotificationService.notifyPlaceSuspended(
      placeId,
      placeData?.name || 'Unknown',
      placeData?.createdBy,
      notes,
      duration,
      expiresAt.toISOString()
    );
  } catch (error) {
    console.error('[SUSPEND] Failed to send notification:', error);
  }

  console.log(`[SUSPEND] Place ${placeId} suspended for ${duration} hours until ${expiresAt.toISOString()}`);

  return {
    oldStatus: placeData?.status,
    newStatus: 'temporarily_suspended',
    suspendedUntil: expiresAt.toISOString(),
    duration
  };
}

async function executeHidePermanentAction(
  adminDb: FirebaseFirestore.Firestore,
  placeId: string,
  placeData: any,
  reportId: string,
  notes: string,
  user: any
) {
  const now = new Date().toISOString();

  // Update place to hidden status
  await adminDb.collection('places').doc(placeId).update({
    status: 'hidden',
    hiddenAt: now,
    hiddenBy: user.id,
    hiddenReason: notes,
    updatedAt: now,
    moderatedBy: user.id
  });

  // Send notification to owner
  try {
    await EnhancedNotificationService.notifyPlaceHidden(
      placeId,
      placeData?.name || 'Unknown',
      placeData?.createdBy,
      notes,
      reportId
    );
  } catch (error) {
    console.error('[HIDE] Failed to send notification:', error);
  }

  console.log(`[HIDE-PERMANENT] Place ${placeId} hidden permanently`);

  return {
    oldStatus: placeData?.status,
    newStatus: 'hidden'
  };
}

async function executeWarningOnlyAction(
  adminDb: FirebaseFirestore.Firestore,
  placeId: string,
  placeData: any,
  reportId: string,
  notes: string,
  user: any
) {
  const now = new Date().toISOString();

  // Just log the warning, don't change place status
  await adminDb.collection('moderation_logs').add({
    action: 'place_warning_issued',
    placeId,
    placeName: placeData?.name,
    moderatorId: user.id,
    reason: notes,
    reportId,
    performedAt: now
  });

  // Send warning notification to owner
  try {
    await EnhancedNotificationService.notifyPlaceWarning(
      placeId,
      placeData?.name || 'Unknown',
      placeData?.createdBy,
      notes
    );
  } catch (error) {
    console.error('[WARNING] Failed to send notification:', error);
  }

  console.log(`[WARNING-ONLY] Warning issued for place ${placeId}`);

  return {
    status: placeData?.status, // No change
    warningIssued: true
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getActionMessage(actionType: string): string {
  const messages: Record<string, string> = {
    'request_edit': 'yêu cầu chỉnh sửa đã được gửi cho owner',
    'suspend': 'địa điểm đã bị tạm đình chỉ',
    'hide_permanent': 'địa điểm đã bị ẩn khỏi công khai',
    'warning_only': 'cảnh báo đã được gửi cho owner'
  };
  return messages[actionType] || 'hành động đã được thực hiện';
}
