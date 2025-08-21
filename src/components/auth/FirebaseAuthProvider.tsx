// src/components/auth/FirebaseAuthProvider.tsx - Real Firebase Auth Provider
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserRole, getUserRole } from '@/lib/rbac';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  verifiedContributor: boolean;
  partnerId?: string;
  createdAt: any;
  updatedAt: any;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
  subscribeNewsletter?: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth Provider Component
export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from Firestore
  const loadUserProfile = async (firebaseUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setProfile({
          id: firebaseUser.uid,
          ...profileData
        });
      } else {
        // Create new profile for first-time users
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          role: 'traveler',
          status: 'active',
          verifiedContributor: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Allow login without email verification in development
      if (process.env.NODE_ENV === 'production' && !result.user.emailVerified) {
        await sendEmailVerification(result.user);
        throw new Error('Vui lòng xác minh email trước khi đăng nhập. Email xác minh đã được gửi.');
      }
      
      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Email hoặc mật khẩu không đúng');
        case 'auth/too-many-requests':
          throw new Error('Quá nhiều lần thử. Vui lòng thử lại sau.');
        case 'auth/user-disabled':
          throw new Error('Tài khoản đã bị khóa');
        default:
          throw new Error(error.message || 'Đăng nhập thất bại');
      }
    }
  };

  // Register with email/password
  const register = async (data: RegisterData) => {
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update display name
      await updateProfile(result.user, {
        displayName: data.fullName
      });
      
      // Send email verification
      await sendEmailVerification(result.user);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        id: result.user.uid,
        email: data.email,
        displayName: data.fullName,
        photoURL: '',
        role: 'traveler',
        status: 'active',
        verifiedContributor: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Email này đã được sử dụng');
        case 'auth/weak-password':
          throw new Error('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.');
        case 'auth/invalid-email':
          throw new Error('Email không hợp lệ');
        default:
          throw new Error(error.message || 'Đăng ký thất bại');
      }
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user profile exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          id: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          role: 'traveler',
          status: 'active',
          verifiedContributor: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }
      
      return result;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          throw new Error('Đăng nhập bị hủy');
        case 'auth/popup-blocked':
          throw new Error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
        default:
          throw new Error(error.message || 'Đăng nhập Google thất bại');
      }
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          throw new Error('Không tìm thấy tài khoản với email này');
        case 'auth/invalid-email':
          throw new Error('Email không hợp lệ');
        default:
          throw new Error(error.message || 'Gửi email reset thất bại');
      }
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Chưa đăng nhập');
    
    try {
      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: new Date()
      }, { merge: true });
      
      // Update local state
      if (profile) {
        setProfile({ ...profile, ...data });
      }
      
      // Update Firebase Auth profile if needed
      if (data.displayName && data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Cập nhật profile thất bại');
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
