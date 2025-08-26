import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin-safe';
import { User, UserRole } from '@/lib/types/auth';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token xác thực không hợp lệ'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'Người dùng không tồn tại'
      };
    }

    const userData = userDoc.data();
    
    return {
      success: true,
      user: {
        id: decodedToken.uid,
        ...userData
      } as User
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    
    return {
      success: false,
      error: 'Token xác thực không hợp lệ'
    };
  }
}

// Permission types
export type Permission = 'create_place' | 'review_content' | 'manage_users' | 'admin' | 'all_permissions';

// Role-to-permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [],
  traveler: [],
  contributor: ['create_place'],
  partner: ['create_place'],
  moderator: ['review_content'],
  admin: ['admin'], // 'admin' implies all permissions
};


// Middleware to check specific permissions
export async function requirePermission(
  request: NextRequest, 
  requiredPermission: Permission
): Promise<AuthResult> {
  const authResult = await verifyAuthToken(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;
  
  // Admin has all permissions
  if (user.role === 'admin') {
    return authResult;
  }

  const userPermissions = rolePermissions[user.role] || [];
  
  if (!userPermissions.includes(requiredPermission)) {
    return {
      success: false,
      error: 'Bạn không có quyền thực hiện hành động này'
    };
  }

  return authResult;
}
