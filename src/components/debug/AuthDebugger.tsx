// src/components/debug/AuthDebugger.tsx - Debug component để show auth state
'use client';

import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '@/components/auth/FirebaseAuthProvider';
import { auth } from '@/lib/firebase';

export function AuthDebugger() {
  const firebaseAuth = useFirebaseAuth();
  const [tokenClaims, setTokenClaims] = useState<any>(null);
  const [currentUID, setCurrentUID] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (auth.currentUser) {
        setCurrentUID(auth.currentUser.uid);
        
        try {
          const tokenResult = await auth.currentUser.getIdTokenResult();
          setTokenClaims(tokenResult.claims);
        } catch (error) {
          console.error('Error getting token claims:', error);
        }
      }
    };

    checkAuth();
    
    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChanged(checkAuth);
    return unsubscribe;
  }, []);

  const forceRefreshToken = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        const tokenResult = await auth.currentUser.getIdTokenResult();
        setTokenClaims(tokenResult.claims);
        alert('Token refreshed! Check console for new claims.');
        console.log('New claims:', tokenResult.claims);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };

  const forceReloadProfile = () => {
    if (auth.currentUser) {
      // Force reload by signing out and back in
      window.location.reload();
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#000',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: 0, color: '#ff6b6b' }}>🔍 Auth Debugger</h3>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Current User UID:</strong><br />
        {currentUID || 'No user'}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Firebase Auth User:</strong><br />
        Email: {firebaseAuth.user?.email || 'None'}<br />
        UID: {firebaseAuth.user?.uid || 'None'}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Firestore Profile:</strong><br />
        Email: {firebaseAuth.profile?.email || 'None'}<br />
        Role: <span style={{ color: firebaseAuth.profile?.role === 'admin' ? '#4ade80' : '#f87171' }}>
          {firebaseAuth.profile?.role || 'None'}
        </span><br />
        Status: {firebaseAuth.profile?.status || 'None'}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Token Claims:</strong><br />
        Role: <span style={{ color: tokenClaims?.role === 'admin' ? '#4ade80' : '#f87171' }}>
          {tokenClaims?.role || 'None'}
        </span><br />
        Verified: {tokenClaims?.verifiedContributor ? 'Yes' : 'No'}
      </div>
      
      <button 
        onClick={forceRefreshToken}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '5px'
        }}
      >
        🔄 Force Refresh Token
      </button>
      
      <button 
        onClick={forceReloadProfile}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Reload Page
      </button>
    </div>
  );
}
