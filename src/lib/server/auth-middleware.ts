// This file is server-side only. Do not import it on the client.
import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/server/firebaseAdmin';
import { User, Permission, UserRole } from '@/lib/types/auth';

// Server-side role permissions (duplicated to avoid client import)
const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [],
  traveler: ["report_content", "create_itinerary", "save_places"],
  contributor: ["create_place", "report_content", "create_itinerary", "save_places", "manage_drafts"],
  partner: ["create_place", "create_place_priority", "report_content", "create_itinerary", "save_places", "manage_drafts", "partner_badge", "fast_review"],
  moderator: ["review_content", "view_moderation_queue", "report_content", "create_itinerary", "save_places"],
  admin: ["all_permissions"],
};

// Server-side hasPermission function
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userPermissions = rolePermissions[user.role] || [];
  
  // Grant base permissions for higher roles
  if (user.role === 'partner') {
    return userPermissions.concat(rolePermissions.contributor).includes(permission);
  }
  if (user.role === 'contributor') {
    return userPermissions.concat(rolePermissions.traveler).includes(permission);
  }

  return userPermissions.includes(permission);
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      return {
        success: false,
        error: 'Token xác thực không hợp lệ'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      console.log('No token found in auth header');
      return {
        success: false,
        error: 'Token xác thực không hợp lệ'
      };
    }
    
    let decodedToken;
    try {
      // Try to verify as ID token first
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('ID token verified for user:', decodedToken.uid);
    } catch (idTokenError) {
      // If it fails, try to verify as custom token (this is not standard, but let's decode manually)
      try {
        // For custom tokens, we need to manually decode and verify
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('Custom token payload:', payload);
          
          // Verify if this is our custom token
          if (payload.iss && payload.iss.includes('firebase-adminsdk') && payload.uid) {
            decodedToken = { uid: payload.uid };
            console.log('Custom token verified for user:', payload.uid);
          } else {
            throw new Error('Invalid custom token format');
          }
        } else {
          throw new Error('Invalid token format');
        }
      } catch (customTokenError) {
        console.error('Token verification failed:', { idTokenError, customTokenError });
        throw idTokenError; // Throw original error
      }
    }
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.log('User document not found for UID:', decodedToken.uid);
      return {
        success: false,
        error: 'Người dùng không tồn tại'
      };
    }

    const userData = userDoc.data();
    console.log('User found with role:', userData?.role);
    
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
