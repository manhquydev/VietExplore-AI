import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin-safe';
import { User } from '@/lib/types/auth';

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

// Middleware to check specific permissions
export async function requirePermission(
  request: NextRequest, 
  permission: string
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

  // Check role-specific permissions
  const rolePermissions = {
    guest: [],
    traveler: ["create_itinerary", "save_places", "report_content"],
    contributor: ["create_place", "create_itinerary", "save_places", "report_content", "manage_drafts"],
    partner: ["create_place_priority", "create_itinerary", "save_places", "report_content", "partner_badge", "fast_review"],
    moderator: ["review_content", "approve_content", "reject_content", "hide_content", "handle_reports", "view_moderation_queue"]
  };

  const userPermissions = rolePermissions[user.role] || [];
  
  if (!userPermissions.includes(permission)) {
    return {
      success: false,
      error: 'Bạn không có quyền thực hiện hành động này'
    };
  }

  return authResult;
}
