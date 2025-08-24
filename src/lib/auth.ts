// src/lib/auth.ts - Authentication helpers
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Types
export interface UserProfile {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
  verifiedContributor: boolean;
  partnerId: string | null;
  disabled: boolean;
  createdAt: any;
  updatedAt: any;
  consent: {
    privacyAcceptedAt: any;
    marketing: boolean;
  };
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  claims: any;
}

// Initialize Functions
const functions = getFunctions();

// Authentication functions
export const authService = {
  // Đăng ký bằng Email/Password
  async registerWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Gửi email xác minh
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }
      
      return userCredential;
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Đăng nhập bằng Email/Password
  async loginWithEmail(email: string, password: string) {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Đăng nhập bằng Google
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Gửi email reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  // Đăng xuất
  async logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Lỗi khi đăng xuất');
    }
  },

  // Gửi lại email xác minh
  async resendEmailVerification() {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error('Không có người dùng đăng nhập');
      }
    } catch (error: any) {
      throw new Error('Lỗi khi gửi email xác minh');
    }
  },

  // Lấy thông tin profile từ Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Refresh token để lấy claims mới
  async refreshToken() {
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true); // Force refresh
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  },

  // Gọi Cloud Function để gán role (Admin only)
  async grantRole(uid: string, role: string, options?: {
    verifiedContributor?: boolean;
    partnerId?: string;
    permissions?: string[];
  }) {
    try {
      const grantRoleFunction = httpsCallable(functions, 'grantRole');
      const result = await grantRoleFunction({
        uid,
        role,
        verifiedContributor: options?.verifiedContributor,
        partnerId: options?.partnerId,
        permissions: options?.permissions
      });
      
      return result.data;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi gán role');
    }
  }
};

// Helper function để xử lý lỗi Firebase Auth
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản với email này';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (tối thiểu 6 ký tự)';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử. Vui lòng thử lại sau';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'auth/operation-not-allowed':
      return 'Phương thức đăng nhập này chưa được kích hoạt';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập đã bị đóng';
    case 'auth/cancelled-popup-request':
      return 'Yêu cầu đăng nhập đã bị hủy';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại';
  }
}

// Hook để theo dõi trạng thái authentication
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    claims: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Lấy claims từ token
          const idTokenResult = await user.getIdTokenResult();
          const claims = idTokenResult.claims;
          
          // Lấy profile từ Firestore
          const profile = await authService.getUserProfile(user.uid);
          
          setAuthState({
            user,
            profile,
            loading: false,
            claims
          });
        } catch (error) {
          console.error('Error loading user data:', error);
          setAuthState({
            user,
            profile: null,
            loading: false,
            claims: null
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          claims: null
        });
      }
    });

    return unsubscribe;
  }, []);

  return authState;
}

// Helper functions cho role checking
export const roleHelpers = {
  isGuest: (claims: any) => !claims,
  isTraveler: (claims: any) => claims?.role === 'traveler',
  isContributor: (claims: any) => claims?.role === 'contributor',
  isPartner: (claims: any) => claims?.role === 'partner',
  isModerator: (claims: any) => claims?.role === 'moderator' || claims?.role === 'admin',
  isAdmin: (claims: any) => claims?.role === 'admin',
  isVerifiedContributor: (claims: any) => claims?.verifiedContributor === true,
  
  // Kiểm tra quyền truy cập
  canCreatePlace: (claims: any) => {
    return claims?.role === 'contributor' || 
           claims?.role === 'partner' || 
           claims?.role === 'moderator' || 
           claims?.role === 'admin';
  },
  
  canModerate: (claims: any) => {
    return claims?.role === 'moderator' || claims?.role === 'admin';
  },
  
  canAccessAdmin: (claims: any) => {
    return claims?.role === 'admin';
  },
  
  requiresEmailVerification: (user: User | null) => {
    return !!(user && !user.emailVerified);
  }
};


