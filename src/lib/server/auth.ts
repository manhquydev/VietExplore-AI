import { NextRequest } from 'next/server';
import { getFirebaseAdmin } from './firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * A custom Error class for authentication-related issues.
 */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * Verifies the Firebase ID token from the Authorization header of a request.
 *
 * @param request The incoming Next.js request object.
 * @returns A promise that resolves with the decoded ID token if valid.
 * @throws {AuthError} If the token is missing, malformed, or invalid.
 */
export async function verifyAuth(
  request: NextRequest
): Promise<DecodedIdToken> {
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    throw new AuthError('Missing Authorization header.');
  }

  if (!authorization.startsWith('Bearer ')) {
    throw new AuthError('Authorization header must be of type Bearer.');
  }

  const token = authorization.substring(7); // Remove "Bearer " prefix
  if (!token) {
    throw new AuthError('Bearer token is missing.');
  }

  try {
    const { adminAuth } = getFirebaseAdmin();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error: any) {
    console.error('Error verifying Firebase ID token:', error);
    // Throw a generic error to avoid leaking implementation details
    throw new AuthError('Invalid or expired authentication token.');
  }
}

/**
 * A higher-order function to wrap API route handlers with authentication
 * and role-based access control.
 *
 * @param handler The API route handler function.
 * @param allowedRoles An optional array of roles that are allowed to access the route.
 * @returns A new handler function that performs auth checks before executing the original handler.
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params?: any; user: DecodedIdToken }
  ) => Promise<Response>,
  allowedRoles?: string[]
) {
  return async (
    request: NextRequest,
    context: { params?: any }
  ): Promise<Response> => {
    try {
      const user = await verifyAuth(request);

      // If specific roles are required, check them now.
      if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role || 'traveler'; // Default to 'traveler' if no role claim
        if (!allowedRoles.includes(userRole as string)) {
          return new Response(
            JSON.stringify({
              error: `Permission denied. User with role '${userRole}' cannot access this resource. Required roles: ${allowedRoles.join(
                ', '
              )}`,
            }),
            { status: 403 } // Forbidden
          );
        }
      }

      // Add the user to the context and call the original handler
      const newContext = { ...context, user };
      return handler(request, newContext);
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
        });
      }
      // For any other unexpected errors
      console.error('An unexpected error occurred in withAuth wrapper:', error);
      return new Response(
        JSON.stringify({ error: 'An internal server error occurred.' }),
        { status: 500 }
      );
    }
  };
}
