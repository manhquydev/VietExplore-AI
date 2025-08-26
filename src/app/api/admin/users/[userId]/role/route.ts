
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { requirePermission } from '@/lib/auth-middleware';
import { UserRole } from '@/lib/types/auth';

// PUT /api/admin/users/[userId]/role - Change user role (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authResult = await requirePermission(request, 'all_permissions');
    if (!authResult.success || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Chỉ admin mới có quyền thay đổi vai trò người dùng' },
        { status: 403 }
      );
    }

    const admin = authResult.user;
    const { newRole, reason } = await request.json();

    // Validate new role
    const validRoles: UserRole[] = ['traveler', 'contributor', 'partner', 'moderator', 'admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Vai trò không hợp lệ' },
        { status: 400 }
      );
    }

    // Get target user
    const userDoc = await adminDb.collection('users').doc(params.userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const currentRole = userData?.role;

    if (currentRole === newRole) {
      return NextResponse.json(
        { error: 'Người dùng đã có vai trò này' },
        { status: 400 }
      );
    }

    if (params.userId === admin.id) {
      return NextResponse.json(
        { error: 'Bạn không thể thay đổi vai trò của chính mình' },
        { status: 400 }
      );
    }
    
    // Set custom claims for role-based access control
    await adminAuth.setCustomUserClaims(params.userId, { role: newRole });

    const now = new Date().toISOString();
    const roleHistoryEntry = {
      previousRole: currentRole,
      newRole,
      changedBy: admin.id,
      changedAt: now,
      reason: reason || 'Được admin thay đổi'
    };

    await adminDb.collection('users').doc(params.userId).update({
      role: newRole,
      updatedAt: now,
      roleHistory: adminDb.FieldValue.arrayUnion(roleHistoryEntry)
    });

    await adminDb.collection('admin_logs').add({
      type: 'role_change',
      adminId: admin.id,
      targetUserId: params.userId,
      action: `Changed role from ${currentRole} to ${newRole}`,
      reason,
      timestamp: now
    });

    return NextResponse.json({
      success: true,
      message: `Đã thay đổi vai trò từ ${currentRole} thành ${newRole}`,
      data: {
        userId: params.userId,
        previousRole: currentRole,
        newRole,
        changedBy: admin.fullName,
        changedAt: now
      }
    });

  } catch (error) {
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: 'Không thể thay đổi vai trò người dùng' },
      { status: 500 }
    );
  }
}
