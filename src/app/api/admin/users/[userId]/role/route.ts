import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/server/firebaseAdmin';
import { verifyAuthToken } from '@/lib/server/auth-middleware';
import { UserRole } from '@/lib/types/auth';
import { FieldValue } from 'firebase-admin/firestore';

// PUT /api/admin/users/[userId]/role - Change user role (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ admin mới có quyền thay đổi vai trò người dùng' },
        { status: 403 }
      );
    }

    const admin = authResult.user;
    const { newRole, reason } = await request.json();
    const { userId } = await params;

    // Validate new role
    const validRoles: UserRole[] = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Vai trò không hợp lệ' },
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
    const currentRole = userData?.role;

    if (currentRole === newRole) {
      return NextResponse.json(
        { success: false, error: 'Người dùng đã có vai trò này' },
        { status: 400 }
      );
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { success: false, error: 'Bạn không thể thay đổi vai trò của chính mình' },
        { status: 400 }
      );
    }
    
    // Set custom claims for role-based access control
    await adminAuth.setCustomUserClaims(userId, { role: newRole });

    const now = new Date().toISOString();
    const roleHistoryEntry = {
      previousRole: currentRole,
      newRole,
      changedBy: admin.id,
      changedAt: now,
      reason: reason || 'Được admin thay đổi'
    };

    await adminDb.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: now,
      roleHistory: FieldValue.arrayUnion(roleHistoryEntry)
    });

    await adminDb.collection('admin_logs').add({
      type: 'role_change',
      adminId: admin.id,
      adminName: admin.fullName || admin.email,
      targetUserId: userId,
      targetUserName: userData?.fullName || userData?.email,
      action: `Changed role from ${currentRole} to ${newRole}`,
      reason,
      timestamp: now
    });

    return NextResponse.json({
      success: true,
      message: `Đã thay đổi vai trò từ ${currentRole} thành ${newRole}`,
      data: {
        userId: userId,
        previousRole: currentRole,
        newRole,
        changedBy: admin.fullName,
        changedAt: now
      }
    });

  } catch (error: any) {
    console.error('Error changing user role:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Không thể thay đổi vai trò người dùng';
    let statusCode = 500;
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Không tìm thấy tài khoản người dùng trong hệ thống xác thực';
      statusCode = 404;
    } else if (error.code === 'auth/invalid-uid') {
      errorMessage = 'ID người dùng không hợp lệ';
      statusCode = 400;
    } else if (error.code === 'permission-denied') {
      errorMessage = 'Không đủ quyền để thực hiện thao tác này';
      statusCode = 403;
    } else if (error.code === 'not-found') {
      errorMessage = 'Không tìm thấy tài liệu người dùng trong cơ sở dữ liệu';
      statusCode = 404;
    } else if (error.code === 9) { // FAILED_PRECONDITION - missing index
      errorMessage = 'Cần tạo chỉ mục cơ sở dữ liệu. Vui lòng liên hệ quản trị viên.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = `Lỗi hệ thống: ${error.message}`;
    }
    
    // Log detailed error for debugging
    console.error('Detailed error info:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      userId: (await params).userId
    });
    
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
