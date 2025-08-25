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
const functions = getFunctions(app, 'asia-southeast1');

// Connect to Firebase Emulators in development
if (typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (useEmulators && isDevelopment) {
    try {
      const emulatorHost = '127.0.0.1';
      console.log('🔧 Connecting to Firebase Emulators...');
      
      // Correct ports from firebase.json
      connectAuthEmulator(auth, `http://${emulatorHost}:9199`, { disableWarnings: true });
      connectFirestoreEmulator(db, emulatorHost, 8181);
      connectStorageEmulator(storage, emulatorHost, 9299);
      connectDatabaseEmulator(rtdb, emulatorHost, 9100);
      connectFunctionsEmulator(functions, emulatorHost, 5556);
      
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
