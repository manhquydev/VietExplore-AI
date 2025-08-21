// src/hooks/useAuth.ts - Compatibility hook for old auth usage
import { useFirebaseAuth } from '@/components/auth/FirebaseAuthProvider';
import { UserRole, getUserRole } from '@/lib/rbac';

// Compatibility interface for existing components
export interface User {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  verified: boolean;
  createdAt: string;
  profile?: {
    bio?: string;
    location?: string;
  };
  stats?: {
    placesContributed: number;
    itinerariesCreated: number;
    helpfulVotes: number;
  };
}

export function useAuth() {
  const firebaseAuth = useFirebaseAuth();
  
  // Convert Firebase user to legacy format
  const user: User | null = firebaseAuth.user && firebaseAuth.profile ? {
    id: firebaseAuth.user.uid,
    email: firebaseAuth.profile.email,
    fullName: firebaseAuth.profile.displayName || '',
    username: firebaseAuth.profile.email.split('@')[0],
    avatar: firebaseAuth.profile.photoURL || '',
    role: firebaseAuth.profile.role,
    verified: firebaseAuth.user.emailVerified,
    createdAt: firebaseAuth.profile.createdAt?.toISOString?.() || new Date().toISOString(),
    profile: {
      bio: '',
      location: ''
    },
    stats: {
      placesContributed: 0,
      itinerariesCreated: 0,
      helpfulVotes: 0
    }
  } : null;

  return {
    user,
    isLoading: firebaseAuth.loading,
    isAuthenticated: firebaseAuth.isAuthenticated,
    login: firebaseAuth.login,
    register: async (data: any) => {
      return firebaseAuth.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreeToTerms,
        subscribeNewsletter: data.subscribeNewsletter
      });
    },
    logout: firebaseAuth.logout,
    updateUser: async (data: Partial<User>) => {
      return firebaseAuth.updateUserProfile({
        displayName: data.fullName,
        ...data
      });
    }
  };
}
