// src/lib/auth-guards.ts - Route guards and middleware
import { useAuth, roleHelpers } from './auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Higher-order component cho route protection
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: {
    requireEmailVerification?: boolean;
    requiredRole?: 'traveler' | 'contributor' | 'partner' | 'moderator' | 'admin';
    redirectTo?: string;
  } = {}
) {
  return function AuthGuardedComponent(props: T) {
    const { user, profile, loading, claims } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // Chưa đăng nhập
        if (!user) {
          router.push(options.redirectTo || '/auth/login');
          return;
        }

        // Yêu cầu xác minh email
        if (options.requireEmailVerification && !user.emailVerified) {
          router.push('/auth/verify-email');
          return;
        }

        // Kiểm tra role yêu cầu
        if (options.requiredRole) {
          const hasRequiredRole = claims?.role === options.requiredRole || 
            (options.requiredRole === 'moderator' && roleHelpers.isModerator(claims)) ||
            (options.requiredRole === 'admin' && roleHelpers.isAdmin(claims));

          if (!hasRequiredRole) {
            router.push('/unauthorized');
            return;
          }
        }
      }
    }, [loading, user, claims, router]);

    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Show nothing while redirecting
    if (!user || 
        (options.requireEmailVerification && !user.emailVerified) ||
        (options.requiredRole && !roleHelpers.canAccessAdmin(claims))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Specific guards for common use cases
export const withEmailVerification = <T extends object>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requireEmailVerification: true });

export const withContributorRole = <T extends object>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requiredRole: 'contributor', requireEmailVerification: true });

export const withModeratorRole = <T extends object>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requiredRole: 'moderator', requireEmailVerification: true });

export const withAdminRole = <T extends object>(Component: React.ComponentType<T>) =>
  withAuth(Component, { requiredRole: 'admin', requireEmailVerification: true });

// Hook để kiểm tra permissions
export function usePermissions() {
  const { user, claims, loading } = useAuth();

  return {
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    canCreatePlace: roleHelpers.canCreatePlace(claims),
    canModerate: roleHelpers.canModerate(claims),
    canAccessAdmin: roleHelpers.canAccessAdmin(claims),
    isVerifiedContributor: roleHelpers.isVerifiedContributor(claims),
    role: claims?.role || 'guest',
    claims
  };
}

// Client-side route guard hook
export function useRouteGuard(options: {
  requireAuth?: boolean;
  requireEmailVerification?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}) {
  const { user, claims, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (options.requireAuth && !user) {
        router.push(options.redirectTo || '/auth/login');
        return;
      }

      if (options.requireEmailVerification && user && !user.emailVerified) {
        router.push('/auth/verify-email');
        return;
      }

      if (options.requiredRole && (!claims?.role || claims.role !== options.requiredRole)) {
        if (!roleHelpers.canAccessAdmin(claims) && options.requiredRole === 'admin') {
          router.push('/unauthorized');
          return;
        }
        if (!roleHelpers.canModerate(claims) && options.requiredRole === 'moderator') {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [loading, user, claims, router, options]);

  return { loading, authorized: !loading && user };
}


