# Hướng Dẫn Tích Hợp Firebase Authentication cho Next.js với TypeScript

## 1. Cài Đặt Dependencies

```bash
npm install firebase
npm install @types/firebase # nếu cần types bổ sung
```

## 2. Cấu Hình Firebase Client

Tạo file `lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Khởi tạo Firebase app (tránh khởi tạo lại)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
```

## 3. Tạo Types cho Authentication

Tạo file `types/auth.ts`:

```typescript
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}

export interface ResetPasswordData {
  email: string;
}
```

## 4. Tạo Hook useAuth

Tạo file `hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { AuthUser, AuthError, LoginFormData, RegisterFormData } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
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

  // Xử lý lỗi Firebase thành tiếng Việt
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

  // Đăng nhập bằng email/password
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

  // Đăng ký bằng email/password
  const registerWithEmail = async (data: RegisterFormData): Promise<boolean> => {
    try {
      setError('');
      
      // Kiểm tra mật khẩu khớp
      if (data.password !== data.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return false;
      }

      // Kiểm tra độ dài mật khẩu
      if (data.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }

      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      // Cập nhật display name nếu có
      if (data.displayName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName
        });
      }

      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setError('');
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (error: any) {
      setError(handleFirebaseError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset mật khẩu
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

  // Đăng xuất
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
```

## 5. Tạo Component Auth Popup

Tạo file `components/AuthPopup.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData, RegisterFormData } from '@/types/auth';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'reset';
}

const AuthPopup: React.FC<AuthPopupProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [success, setSuccess] = useState<string>('');
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    resetPassword, 
    error, 
    setError, 
    loading 
  } = useAuth();

  // Form states
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const [resetEmail, setResetEmail] = useState('');

  // Reset form khi đóng popup
  const handleClose = () => {
    setError('');
    setSuccess('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ email: '', password: '', confirmPassword: '', displayName: '' });
    setResetEmail('');
    onClose();
  };

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithEmail(loginData);
    if (success) {
      handleClose();
    }
  };

  // Xử lý đăng ký
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await registerWithEmail(registerData);
    if (success) {
      handleClose();
    }
  };

  // Xử lý đăng nhập Google
  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      handleClose();
    }
  };

  // Xử lý reset mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Vui lòng nhập email');
      return;
    }
    
    const success = await resetPassword(resetEmail);
    if (success) {
      setSuccess('Email reset mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
      setResetEmail('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'login' && 'Đăng Nhập'}
            {mode === 'register' && 'Đăng Ký'}
            {mode === 'reset' && 'Quên Mật Khẩu'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Hiển thị thành công */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Form Đăng Nhập */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* Form Đăng Ký */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên hiển thị (không bắt buộc)
              </label>
              <input
                type="text"
                value={registerData.displayName}
                onChange={(e) => setRegisterData({...registerData, displayName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu (ít nhất 6 ký tự)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                required
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
          </form>
        )}

        {/* Form Reset Mật Khẩu */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email của bạn
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
                placeholder="Nhập email để nhận link reset mật khẩu"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi email...' : 'Gửi Email Reset'}
            </button>
          </form>
        )}

        {/* Đăng nhập Google (chỉ hiển thị ở mode login và register) */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="my-4 text-center text-gray-500">hoặc</div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>🔍</span>
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}</span>
            </button>
          </>
        )}

        {/* Navigation links */}
        <div className="mt-4 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccess('');
                }}
                className="text-blue-600 hover:underline text-sm block"
                disabled={loading}
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
              <button
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setSuccess('');
                }}
                className="text-yellow-600 hover:underline text-sm block"
                disabled={loading}
              >
                Quên mật khẩu?
              </button>
            </>
          )}

          {mode === 'register' && (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className="text-blue-600 hover:underline text-sm"
              disabled={loading}
            >
              Đã có tài khoản? Đăng nhập
            </button>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className="text-blue-600 hover:underline text-sm"
              disabled={loading}
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
```

## 6. Sử Dụng Component trong App

Tạo file `components/AuthButton.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthPopup from './AuthPopup';

const AuthButton: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="animate-pulse">Đang tải...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm">
            Xin chào, {user.displayName || user.email}
          </span>
        </div>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Đăng nhập
      </button>
      
      <AuthPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  );
};

export default AuthButton;
```

## 7. Cấu Hình Firebase Console

### Bật Authentication Methods:
1. Vào Firebase Console → Authentication → Sign-in method
2. Bật **Email/Password**
3. Bật **Google** và cấu hình OAuth consent screen

### Cấu hình Domains được phép:
1. Thêm domain của bạn vào **Authorized domains**
2. Để development: thêm `localhost`

## 8. Xử Lý Lỗi Chi Tiết

Component đã xử lý các lỗi phổ biến:

- **`auth/email-already-in-use`**: Email đã tồn tại
- **`auth/weak-password`**: Mật khẩu quá yếu
- **`auth/invalid-credential`**: Email/mật khẩu sai
- **`auth/user-not-found`**: Không tìm thấy user
- **Mật khẩu không khớp**: Validation phía client
- **Lỗi mạng**: Kết nối internet

## 9. Sử Dụng trong Page

```typescript
// app/page.tsx hoặc pages/index.tsx
import AuthButton from '@/components/AuthButton';

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center">
        <h1>VietExplore AI</h1>
        <AuthButton />
      </header>
      
      {/* Nội dung trang */}
    </div>
  );
}
```

## 10. Bảo Mật Nâng Cao

### Protected Routes:
```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Đang kiểm tra quyền truy cập...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

Tài liệu này cung cấp hệ thống authentication hoàn chỉnh với xử lý lỗi chi tiết, giao diện popup thân thiện và hỗ trợ cả Google và email/password authentication cho dự án Next.js TypeScript của bạn.