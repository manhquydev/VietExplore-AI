// This file is server-side only. Do not import it on the client.
import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/firebaseAdmin';
import { User, Permission } from '@/lib/types/auth';
import { hasPermission } from '@/lib/auth/permissions';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  if (!adminAuth || !adminDb) {
    return {
      success: false,
      error: 'Firebase Admin SDK not initialized'
    };
  }

  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Token xác thực không hợp lệ'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    
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

export async function requirePermission(
  request: NextRequest, 
  requiredPermission: Permission
): Promise<AuthResult> {
  const authResult = await verifyAuthToken(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  const user = authResult.user;
  
  if (!hasPermission(user, requiredPermission)) {
    return {
      success: false,
      error: 'Bạn không có quyền thực hiện hành động này'
    };
  }

  return authResult;
}
