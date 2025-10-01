import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { getDatabase } from 'firebase-admin/database';

// PUT /api/admin/users/[userId]/status - Toggle user account status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminDb = getAdminDb();

    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ admin mới có quyền thay đổi trạng thái người dùng' },
        { status: 403 }
      );
    }

    const admin = authResult.user;
    const { disabled } = await request.json();
    const { userId } = await params;

    // Validate disabled is boolean
    if (typeof disabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Tham số disabled phải là boolean' },
        { status: 400 }
      );
    }

    // Get target user
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentStatus = userData?.disabled || false;

    if (currentStatus === disabled) {
      return NextResponse.json(
        { success: false, error: disabled ? 'Người dùng đã bị khóa' : 'Người dùng đã được mở khóa' },
        { status: 400 }
      );
    }

    // Prevent admin from disabling themselves
    if (userId === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể thay đổi trạng thái của chính mình' },
        { status: 400 }
      );
    }

    // Prevent disabling other admins
    if (disabled && userData?.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Không thể khóa tài khoản admin khác' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    // Update user status
    await adminDb.collection('users').doc(userId).update({
      disabled,
      updatedAt: now,
      ...(disabled ? {
        disabledAt: now,
        disabledBy: admin.id
      } : {
        disabledAt: null,
        disabledBy: null,
        enabledAt: now,
        enabledBy: admin.id
      })
    });

    // Log admin action
    await adminDb.collection('admin_logs').add({
      type: disabled ? 'user_disabled' : 'user_enabled',
      adminId: admin.id,
      adminName: admin.fullName || admin.email,
      targetUserId: userId,
      targetUserName: userData?.fullName || userData?.email,
      action: disabled ? 'Disabled user account' : 'Enabled user account',
      timestamp: now
    });

    // Send notification to user via Realtime Database
    try {
      const realtimeDb = getDatabase();
      const notificationRef = realtimeDb.ref(`notifications/${userId}`).push();

      await notificationRef.set({
        id: notificationRef.key,
        type: disabled ? 'account_disabled' : 'account_enabled',
        title: disabled ? 'Tài khoản đã bị khóa' : 'Tài khoản đã được mở khóa',
        message: disabled
          ? 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ để biết thêm chi tiết.'
          : 'Tài khoản của bạn đã được mở khóa. Bạn có thể tiếp tục sử dụng các tính năng của hệ thống.',
        actionUrl: '/settings',
        metadata: {
          changedBy: admin.fullName || admin.email,
          changedAt: now
        },
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        read: false
      });

      console.log('Notification sent successfully to user:', userId);
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the status change if notification fails
    }

    return NextResponse.json({
      success: true,
      message: disabled ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      data: {
        userId: userId,
        disabled,
        changedBy: admin.fullName,
        changedAt: now
      }
    });

  } catch (error: any) {
    console.error('Error changing user status:', error);

    let errorMessage = 'Không thể thay đổi trạng thái người dùng';
    let statusCode = 500;

    if (error.code === 'not-found') {
      errorMessage = 'Không tìm thấy tài liệu người dùng trong cơ sở dữ liệu';
      statusCode = 404;
    } else if (error.code === 'permission-denied') {
      errorMessage = 'Không đủ quyền để thực hiện thao tác này';
      statusCode = 403;
    } else if (error.message) {
      errorMessage = `Lỗi hệ thống: ${error.message}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          originalMessage: error.message
        } : undefined
      },
      { status: statusCode }
    );
  }
}
