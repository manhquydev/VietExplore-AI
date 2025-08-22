// src/components/debug/DirectFirestoreDebugger.tsx - Direct Firestore read
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export function DirectFirestoreDebugger() {
  const [directProfile, setDirectProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkDirectFirestore = async () => {
      if (auth.currentUser) {
        try {
          console.log('🔍 Direct Firestore read for:', auth.currentUser.uid);
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDirectProfile(data);
            console.log('✅ Direct read success:', data);
          } else {
            setError('Document not found');
            console.log('❌ Document not found');
          }
        } catch (err) {
          console.error('❌ Direct read error:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    };

    checkDirectFirestore();
    
    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChanged(checkDirectFirestore);
    return unsubscribe;
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: '#1f2937',
      color: '#fff',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: 0, color: '#10b981' }}>🔍 Direct Firestore Read</h3>
      
      {error ? (
        <div style={{ marginTop: '10px', color: '#ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div style={{ marginTop: '10px' }}>
          <strong>Direct Role:</strong> <span style={{ 
            color: directProfile?.role === 'admin' ? '#10b981' : '#ef4444',
            fontWeight: 'bold'
          }}>
            {directProfile?.role || 'Loading...'}
          </span><br />
          <strong>Email:</strong> {directProfile?.email || 'Loading...'}<br />
          <strong>Status:</strong> {directProfile?.status || 'Loading...'}<br />
          <strong>UID:</strong> {auth.currentUser?.uid || 'None'}
        </div>
      )}
      
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          padding: '5px 10px',
          background: '#10b981',
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
