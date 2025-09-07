# Tài liệu hướng dẫn chi tiết: Firebase Google Authentication cho dự án Web

## 1. Tổng quan

Firebase Authentication với Google Sign-in cung cấp cách thức đơn giản để user đăng nhập bằng tài khoản Google của họ. **Điểm quan trọng**: Firebase tự động tạo user mới trong hệ thống khi họ đăng nhập lần đầu tiên, không cần quy trình đăng ký riêng biệt.[1]

## 2. Cài đặt và cấu hình cơ bản

### 2.1. Cài đặt dependencies

```bash
npm install firebase
```

### 2.2. Cấu hình Firebase

```javascript
// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: Thêm scopes nếu cần
googleProvider.addScope('profile');
googleProvider.addScope('email');
```

### 2.3. Enable Google Sign-in trong Firebase Console

1. Vào Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Thêm authorized domains cho production

## 3. Kiến trúc xử lý Authentication

### 3.1. Phương án Single Sign-in Flow (Khuyến nghị)

```javascript
// utils/auth.js
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export const authenticateWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isNewUser = result.additionalUserInfo?.isNewUser;
    
    console.log('Authentication successful:', {
      uid: user.uid,
      email: user.email,
      isNewUser
    });
    
    if (isNewUser) {
      // Tạo document mới cho user trong Firestore
      await createUserDocument(user);
      return {
        user,
        isNewUser: true,
        message: 'Tài khoản đã được tạo thành công!'
      };
    } else {
      // Load dữ liệu user hiện có
      const userData = await getUserDocument(user.uid);
      return {
        user,
        userData,
        isNewUser: false,
        message: 'Đăng nhập thành công!'
      };
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    throw handleAuthError(error);
  }
};

const createUserDocument = async (user) => {
  const userDocRef = doc(db, 'users', user.uid);
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: 'google',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Thêm các field khác theo yêu cầu dự án
    profile: {
      isProfileComplete: false,
      preferences: {},
    },
    settings: {
      notifications: true,
      language: 'vi'
    }
  };
  
  await setDoc(userDocRef, userData);
  console.log('User document created successfully');
  
  return userData;
};

const getUserDocument = async (uid) => {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    throw new Error('User document not found');
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};
```

### 3.2. Error Handling chi tiết

```javascript
const handleAuthError = (error) => {
  const errorMessages = {
    'auth/account-exists-with-different-credential': {
      message: 'Tài khoản với email này đã tồn tại với phương thức đăng nhập khác. Vui lòng sử dụng phương thức đăng nhập ban đầu.',
      code: 'ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL'
    },
    'auth/popup-closed-by-user': {
      message: 'Đăng nhập đã bị hủy.',
      code: 'POPUP_CLOSED'
    },
    'auth/popup-blocked': {
      message: 'Popup đăng nhập bị chặn bởi trình duyệt. Vui lòng cho phép popup và thử lại.',
      code: 'POPUP_BLOCKED'
    },
    'auth/cancelled-popup-request': {
      message: 'Yêu cầu đăng nhập đã bị hủy.',
      code: 'CANCELLED_POPUP'
    },
    'auth/network-request-failed': {
      message: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.',
      code: 'NETWORK_ERROR'
    }
  };
  
  const errorInfo = errorMessages[error.code] || {
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    code: 'UNKNOWN_ERROR'
  };
  
  return {
    ...errorInfo,
    originalError: error
  };
};
```

## 4. Xử lý trường hợp Account Linking

### 4.1. Khi user đã có account với email/password

```javascript
import { fetchSignInMethodsForEmail, linkWithCredential, EmailAuthProvider } from 'firebase/auth';

const handleAccountExistsError = async (error) => {
  if (error.code === 'auth/account-exists-with-different-credential') {
    const email = error.customData?.email;
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    if (email && credential) {
      // Kiểm tra các phương thức đăng nhập hiện có
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.includes('password')) {
        // Yêu cầu user đăng nhập bằng password trước, sau đó link accounts
        return {
          requiresPasswordSignIn: true,
          email,
          pendingCredential: credential,
          message: 'Vui lòng đăng nhập bằng mật khẩu để liên kết tài khoản Google.'
        };
      }
    }
  }
  
  throw error;
};

const linkGoogleAccount = async (user, googleCredential) => {
  try {
    await linkWithCredential(user, googleCredential);
    console.log('Accounts linked successfully');
    return true;
  } catch (error) {
    console.error('Account linking failed:', error);
    throw error;
  }
};
```

## 5. React Component Implementation

### 5.1. Auth Context Provider

```javascript
// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { getUserDocument } from '../utils/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Load user data from Firestore
          const userDoc = await getUserDocument(firebaseUser.uid);
          setUserData(userDoc);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 5.2. Login Component

```javascript
// components/LoginButton.js
import React, { useState } from 'react';
import { authenticateWithGoogle } from '../utils/auth';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authenticateWithGoogle();
      
      // Hiển thị message phù hợp
      if (result.isNewUser) {
        console.log('Welcome new user!');
        // Redirect to onboarding or profile setup
        onSuccess?.({
          ...result,
          redirectTo: '/onboarding'
        });
      } else {
        console.log('Welcome back!');
        // Redirect to dashboard
        onSuccess?.({
          ...result,
          redirectTo: '/dashboard'
        });
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
      onError?.(error);
      
      // Xử lý các error đặc biệt
      if (error.code === 'ACCOUNT_EXISTS_DIFFERENT_CREDENTIAL') {
        // Hiển thị UI để user chọn phương thức đăng nhập khác
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-login-container">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="google-login-btn"
      >
        {isLoading ? (
          <span>Đang đăng nhập...</span>
        ) : (
          <>
            <img src="/google-icon.svg" alt="Google" />
            Đăng nhập với Google
          </>
        )}
      </button>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
```

## 6. Advanced Features

### 6.1. User Profile Management

```javascript
// utils/userProfile.js
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from './firebase';

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp(),
      'profile.isProfileComplete': true
    });
    
    // Update Firebase Auth profile if needed
    if (profileData.displayName || profileData.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });
    }
    
    return true;
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
};
```

### 6.2. Session Management

```javascript
// utils/session.js
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

export const setAuthPersistence = async (rememberMe = true) => {
  try {
    const persistence = rememberMe 
      ? browserLocalPersistence 
      : browserSessionPersistence;
      
    await setPersistence(auth, persistence);
  } catch (error) {
    console.error('Failed to set persistence:', error);
  }
};
```

## 7. Security Best Practices

### 7.1. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Additional rules for other collections
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### 7.2. Input Validation

```javascript
// utils/validation.js
export const validateUserData = (userData) => {
  const errors = {};
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!userData.displayName || userData.displayName.trim().length < 2) {
    errors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## 8. Testing Strategy

### 8.1. Unit Tests

```javascript
// __tests__/auth.test.js
import { authenticateWithGoogle, handleAuthError } from '../utils/auth';
import { signInWithPopup } from 'firebase/auth';

jest.mock('firebase/auth');

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle new user registration', async () => {
    const mockResult = {
      user: { uid: '123', email: 'test@example.com' },
      additionalUserInfo: { isNewUser: true }
    };
    
    signInWithPopup.mockResolvedValue(mockResult);
    
    const result = await authenticateWithGoogle();
    
    expect(result.isNewUser).toBe(true);
    expect(result.user.uid).toBe('123');
  });

  test('should handle existing user login', async () => {
    const mockResult = {
      user: { uid: '123', email: 'test@example.com' },
      additionalUserInfo: { isNewUser: false }
    };
    
    signInWithPopup.mockResolvedValue(mockResult);
    
    const result = await authenticateWithGoogle();
    
    expect(result.isNewUser).toBe(false);
  });
});
```

### 8.2. Integration Tests với Firebase Emulator

```javascript
// firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    }
  }
}
```

```javascript
// __tests__/auth.integration.test.js
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

beforeAll(() => {
  if (process.env.NODE_ENV === 'test') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
});
```

## 9. Monitoring và Logging

### 9.1. Error Tracking

```javascript
// utils/monitoring.js
export const logAuthEvent = (eventType, data) => {
  console.log(`Auth Event: ${eventType}`, data);
  
  // Gửi đến monitoring service (Sentry, LogRocket, etc.)
  if (window.analytics) {
    window.analytics.track(eventType, data);
  }
};

export const logAuthError = (error, context) => {
  console.error('Auth Error:', error, context);
  
  // Report to error tracking service
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { context: 'authentication' },
      extra: context
    });
  }
};
```

## 10. UX Guidelines

### 10.1. Loading States

```javascript
const LoginPage = () => {
  const [authState, setAuthState] = useState('idle'); // idle, loading, success, error
  
  return (
    <div className="login-container">
      {authState === 'loading' && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang xử lý đăng nhập...</p>
        </div>
      )}
      
      <GoogleLoginButton 
        onSuccess={() => setAuthState('success')}
        onError={() => setAuthState('error')}
      />
    </div>
  );
};
```

### 10.2. Success/Error Messages

```javascript
const NotificationSystem = ({ message, type, onClose }) => {
  return (
    <div className={`notification notification--${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>×</button>
    </div>
  );
};
```

## 11. Deployment Checklist

### ✅ Production Readiness

- [ ] Thêm production domain vào Firebase Console
- [ ] Cấu hình proper error handling cho tất cả edge cases
- [ ] Implement proper loading states và error messages
- [ ] Set up monitoring và error tracking
- [ ] Test trên multiple browsers và devices
- [ ] Verify Firestore security rules
- [ ] Enable proper CORS settings
- [ ] Test account linking scenarios
- [ ] Implement proper session management
- [ ] Add proper input validation

## Kết luận

Giải pháp **Single Sign-in Flow với `isNewUser` detection** là approach tốt nhất cho hầu hết các dự án. Nó đơn giản, user-friendly và tuân thủ best practices của Firebase. Quan trọng nhất là xử lý đầy đủ các error cases và cung cấp feedback rõ ràng cho user trong mọi tình huống.[2][1]

[1](https://firebase.google.com/docs/auth/web/google-signin)
[2](https://stackoverflow.com/questions/75450835/in-firebase-android-development-what-does-the-isnewuser-method-refer-to-exact)