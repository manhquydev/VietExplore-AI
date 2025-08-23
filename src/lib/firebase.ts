// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAruiU_SkLHyOKE9tK5nWkc1FMCYJ4jfJc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vietexplore-ai.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://vietexplore-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vietexplore-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vietexplore-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "366287046860",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:366287046860:web:1ab1d22c3be92ba2fd9a69",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
const functions = getFunctions(app);

// Connect to Firebase Emulators in development
if (typeof window !== 'undefined') {
  // Check if we should use emulators
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (useEmulators && isDevelopment) {
    try {
      // Connect to Auth Emulator (check if not already connected)
      try {
        connectAuthEmulator(auth, 'http://127.0.0.1:9888', { disableWarnings: true });
        console.log('🔧 Connected to Auth Emulator');
      } catch (authError: any) {
        if (authError.code !== 'auth/emulator-config-failed') {
          throw authError;
        }
        console.log('🔧 Auth Emulator already connected');
      }
      
      // Connect to Firestore Emulator (check if not already connected)
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8888);
        console.log('🔧 Connected to Firestore Emulator');
      } catch (firestoreError: any) {
        if (firestoreError.code !== 'firestore/failed-precondition') {
          throw firestoreError;
        }
        console.log('🔧 Firestore Emulator already connected');
      }
      
      // Connect to Storage Emulator (check if not already connected)
      try {
        connectStorageEmulator(storage, '127.0.0.1', 9666);
        console.log('🔧 Connected to Storage Emulator');
      } catch (storageError: any) {
        if (storageError.code !== 'storage/emulator-config-failed') {
          throw storageError;
        }
        console.log('🔧 Storage Emulator already connected');
      }
      
      // Connect to Realtime Database Emulator (check if not already connected)
      try {
        connectDatabaseEmulator(rtdb, '127.0.0.1', 9777);
        console.log('🔧 Connected to Database Emulator');
      } catch (dbError: any) {
        if (dbError.code !== 'database/emulator-config-failed') {
          throw dbError;
        }
        console.log('🔧 Database Emulator already connected');
      }
      
      // Connect to Functions Emulator (check if not already connected)
      try {
        connectFunctionsEmulator(functions, '127.0.0.1', 5555);
        console.log('🔧 Connected to Functions Emulator');
      } catch (functionsError: any) {
        if (functionsError.code !== 'functions/emulator-config-failed') {
          throw functionsError;
        }
        console.log('🔧 Functions Emulator already connected');
      }
      
      console.log('✅ All Firebase Emulators connected successfully');
      console.log('🔒 Using LOCAL EMULATORS - Safe for development');
    } catch (error) {
      console.warn('⚠️ Firebase Emulator connection failed:', error);
      console.log('🌐 Falling back to Firebase Production');
    }
  } else if (isDevelopment && !useEmulators) {
    console.log('🌐 Development mode using Firebase Production');
    console.warn('⚠️ BE CAREFUL: You are affecting PRODUCTION data!');
  } else {
    console.log('🏭 Production mode using Firebase Cloud');
  }
}

// Initialize App Check for security (disabled in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const appCheckKey = process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_KEY || '6Lcysq0rAAAAALEPzAMOrcdpMa63nQ5hqMecpg8X';
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckKey),
      isTokenAutoRefreshEnabled: true
    });
    console.log('✅ App Check initialized successfully');
  } catch (error) {
    console.warn('⚠️ App Check initialization failed:', error);
  }
} else if (typeof window !== 'undefined') {
  console.log('🔧 App Check disabled in development mode');
}

export { app, db, auth, storage, rtdb, functions };
