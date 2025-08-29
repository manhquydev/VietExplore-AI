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
      // Check if user is the author of this content
      const contentDoc = await adminDb.collection('places').doc(contentId).get();
      if (!contentDoc.exists || contentDoc.data()?.createdBy !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Bạn không có quyền xem log kiểm duyệt' },
          { status: 403 }
        );
      }
    }

    // Get moderation logs for this content
    const logsSnapshot = await adminDb
      .collection('moderation_logs')
      .where('contentId', '==', contentId)
      .orderBy('timestamp', 'desc')
      .get();

    const logs = [];
    
    for (const doc of logsSnapshot.docs) {
      const logData = doc.data();
      
      // Get moderator info
      let moderatorData = null;
      if (logData.moderatorId) {
        const moderatorDoc = await adminDb.collection('users').doc(logData.moderatorId).get();
        moderatorData = moderatorDoc.data();
      }
      
      logs.push({
        id: doc.id,
        ...logData,
        moderator: moderatorData ? {
          id: logData.moderatorId,
          fullName: moderatorData.fullName,
          role: moderatorData.role,
          avatar: moderatorData.avatar
        } : null
      });
    }

    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Error fetching moderation logs:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải log kiểm duyệt' },
      { status: 500 }
    );
  }
}