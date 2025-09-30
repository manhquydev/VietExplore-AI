import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCustomToken,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider, isMobileDevice } from '@/lib/firebase';
import { AuthUser, LoginFormData, RegisterFormData } from '@/lib/types/auth';
import { EmailVerificationService } from '@/lib/auth/email-verification';
import { toastService } from '@/lib/ui/toast-service';
import {
  processFirebaseAuthError,
  logAuthError,
  handleNetworkError,
  createAPIError,
  ProcessedAuthError
} from '@/lib/auth/error-handlers';
import {
  AuthAction,
  AUTH_SUCCESS_MESSAGES,
  VALIDATION_ERRORS
} from '@/lib/auth/auth-constants';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Check if user document exists, create if not
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // If user document doesn't exist (401), try to create it
          if (response.status === 401) {
            console.log('User document not found, creating...');
            const createResponse = await fetch('/api/auth/create-missing-user', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (createResponse.ok) {
              console.log('User document created successfully');
            }
          }
        } catch (error) {
          console.error('Error checking/creating user document:', error);
        }
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Check for redirect result on component mount (for mobile devices)
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Redirect authentication successful');
          await handlePostAuthActions(result);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError(handleFirebaseError(error as AuthError));
      }
    };

    checkRedirectResult();
    return () => unsubscribe();
  }, []);

  // Enhanced error handler with Toast notifications
  const handleFirebaseError = (error: any, action?: AuthAction): string => {
    const processedError = processFirebaseAuthError(error, action);
    logAuthError(processedError, { action });

    // Show toast notification using toastService
    toastService.error(
      processedError.severity === 'critical' ? 'Lỗi nghiêm trọng' : 'Lỗi',
      processedError.userMessage
    );

    return processedError.userMessage;
  };

  const loginWithEmail = async (data: LoginFormData): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);

      // Validate input
      if (!data.email || !data.password) {
        const errorMsg = VALIDATION_ERRORS.FIELDS_REQUIRED;
        setError(errorMsg);
        toastService.error('Thiếu thông tin', errorMsg);
        return false;
      }

      await signInWithEmailAndPassword(auth, data.email, data.password);

      // Success notification
      toastService.success('Thành công', AUTH_SUCCESS_MESSAGES.LOGIN_SUCCESS);

      return true;
    } catch (error: any) {
      const errorMsg = handleFirebaseError(error, AuthAction.LOGIN);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (data: RegisterFormData): Promise<boolean> => {
    try {
      setError('');

      // Validate password match
      if (data.password !== data.confirmPassword) {
        const errorMsg = VALIDATION_ERRORS.PASSWORD_MISMATCH;
        setError(errorMsg);
        toastService.error('Lỗi xác thực', errorMsg);
        return false;
      }

      // Validate password length
      if (data.password.length < 6) {
        const errorMsg = VALIDATION_ERRORS.PASSWORD_MIN_LENGTH;
        setError(errorMsg);
        toastService.error('Mật khẩu không hợp lệ', errorMsg);
        return false;
      }

      setLoading(true);

      // Call API register endpoint to create user document in Firestore
      console.log('Calling register API with data:', {
        email: data.email,
        fullName: data.displayName || '',
        acceptTerms: true
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.displayName || '',
          acceptTerms: true
        }),
      });

      const result = await response.json();
      console.log('Register API response:', result);

      if (!response.ok) {
        console.error('Register API error:', result);
        const apiError = createAPIError(response.status, result.error || 'Đăng ký thất bại');
        logAuthError(apiError, { action: AuthAction.REGISTER });
        setError(apiError.userMessage);
        toastService.error('Đăng ký thất bại', apiError.userMessage);
        return false;
      }

      // Sign in with the custom token from API
      if (result.token) {
        console.log('Signing in with custom token...');
        await signInWithCustomToken(auth, result.token);
        console.log('Successfully signed in with custom token');

        // Send verification email for new email/password registrations
        if (result.shouldSendVerification && auth.currentUser) {
          try {
            console.log('Sending verification email...');
            await EmailVerificationService.sendVerificationEmail(auth.currentUser);
            console.log('Verification email sent successfully');
            toastService.info('Email xác thực', AUTH_SUCCESS_MESSAGES.EMAIL_VERIFICATION_SENT);
          } catch (verificationError) {
            console.error('Error sending verification email:', verificationError);
            // Don't fail the registration if email sending fails
          }
        }

        // Success notification
        toastService.success('Đăng ký thành công', AUTH_SUCCESS_MESSAGES.REGISTER_SUCCESS);
      }

      return true;
    } catch (error: any) {
      const errorMsg = handleFirebaseError(error, AuthAction.REGISTER);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper function for post-authentication actions
  const handlePostAuthActions = async (result: any) => {
    if (result.user) {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${await result.user.getIdToken()}`
        }
      });
      
      // If user document doesn't exist (401), create it
      if (response.status === 401) {
        const createResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: result.user.email,
            password: 'google-auth', // placeholder for Google users
            fullName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            acceptTerms: true,
            isGoogleAuth: true
          }),
        });
        
        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.error || 'Không thể tạo tài khoản');
        }
      }
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);

      // Enhanced 2025 approach: Use different methods for mobile vs desktop
      const isMobile = isMobileDevice();

      if (isMobile) {
        // Use redirect method for mobile devices (more reliable)
        console.log('Using redirect method for mobile device');
        toastService.info('Đang chuyển hướng...', 'Vui lòng đợi trong giây lát');
        await signInWithRedirect(auth, googleProvider);
        // Note: The actual authentication result will be handled by getRedirectResult in useEffect
        return true; // Return true immediately for redirect flow
      } else {
        // Use popup method for desktop (better UX)
        console.log('Using popup method for desktop device');
        const result = await signInWithPopup(auth, googleProvider);
        await handlePostAuthActions(result);

        // Success notification
        toastService.success('Thành công', AUTH_SUCCESS_MESSAGES.GOOGLE_LOGIN_SUCCESS);

        return true;
      }

    } catch (error: any) {
      console.error('Google authentication error:', error);

      // Enhanced error handling for 2025
      if (error.code === 'auth/popup-blocked') {
        const errorMsg = 'Popup bị chặn. Vui lòng cho phép popup trong trình duyệt và thử lại';
        setError(errorMsg);
        toastService.error('Popup bị chặn', errorMsg);
      } else if (error.code === 'auth/popup-closed-by-user') {
        const errorMsg = 'Đăng nhập đã bị hủy';
        setError(errorMsg);
        // Don't show toast for user-cancelled actions
        console.log('User cancelled Google sign-in');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Silent cancellation, don't notify user
        console.log('Popup request cancelled');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        const errorMsg = 'Email này đã được đăng ký với phương thức khác. Vui lòng đăng nhập bằng email/mật khẩu';
        setError(errorMsg);
        toastService.warning('Tài khoản đã tồn tại', errorMsg);
      } else {
        const errorMsg = handleFirebaseError(error, AuthAction.LOGIN);
        setError(errorMsg);
      }
      return false;
    } finally {
      if (!isMobileDevice()) {
        // Only set loading to false for popup flow
        // For redirect flow, loading state will be managed by auth state change
        setLoading(false);
      }
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);

      if (!email || !email.trim()) {
        const errorMsg = VALIDATION_ERRORS.EMAIL_REQUIRED;
        setError(errorMsg);
        toastService.error('Thiếu thông tin', errorMsg);
        return false;
      }

      await sendPasswordResetEmail(auth, email);

      toastService.success('Email đã gửi', AUTH_SUCCESS_MESSAGES.PASSWORD_RESET_SENT);

      return true;
    } catch (error: any) {
      const errorMsg = handleFirebaseError(error, AuthAction.PASSWORD_RESET);
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toastService.success('Đã đăng xuất', AUTH_SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error: any) {
      const errorMsg = handleFirebaseError(error, AuthAction.LOGOUT);
      setError(errorMsg);
    }
  };

  return {
    user,
    loading,
    error,
    setError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    logout,
  };
};