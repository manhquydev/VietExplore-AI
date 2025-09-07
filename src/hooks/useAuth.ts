import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCustomToken,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthUser, LoginFormData, RegisterFormData } from '@/lib/types/auth';
import { EmailVerificationService } from '@/lib/auth/email-verification';

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

    return () => unsubscribe();
  }, []);

  const handleFirebaseError = (error: any): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng cho tài khoản khác';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu ít nhất 6 ký tự';
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác';
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không chính xác';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần thử. Vui lòng thử lại sau';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
      case 'auth/popup-closed-by-user':
        return 'Cửa sổ đăng nhập đã bị đóng';
      case 'auth/cancelled-popup-request':
        return 'Yêu cầu đăng nhập đã bị hủy';
      default:
        return error.message || 'Đã có lỗi xảy ra';
    }
  };

  const loginWithEmail = async (data: LoginFormData): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, data.email, data.password);
      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (data: RegisterFormData): Promise<boolean> => {
    try {
      setError('');
      
      if (data.password !== data.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return false;
      }

      if (data.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
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
        setError(result.error || 'Đăng ký thất bại');
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
          } catch (verificationError) {
            console.error('Error sending verification email:', verificationError);
            // Don't fail the registration if email sending fails
          }
        }
      }

      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, create if not
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
            setError(errorData.error || 'Không thể tạo tài khoản');
            return false;
          }
        }
      }
      
      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setError(handleFirebaseError(error));
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