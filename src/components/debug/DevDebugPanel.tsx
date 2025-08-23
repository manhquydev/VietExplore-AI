// src/components/debug/DevDebugPanel.tsx - Unified debug panel
'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/components/auth/FirebaseAuthProvider';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { UserRoleDisplay } from '@/components/ui/role-badge';
import { MOCK_USERS, TEST_CREDENTIALS, switchToRole } from '@/lib/mock-data';

export function DevDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'auth' | 'roles'>('auth');
  const firebaseAuth = useFirebaseAuth();
  const { user, updateUser, logout } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleRoleSwitch = (role: string) => {
    if (role === 'guest') {
      logout();
      return;
    }
    
    const mockUser = switchToRole(role as keyof typeof TEST_CREDENTIALS);
    if (mockUser) {
      updateUser(mockUser);
      localStorage.setItem('auth_token', `mock_token_${role}_${Date.now()}`);
    }
  };

  const forceRefreshToken = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        alert('Token refreshed!');
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };

  if (!isExpanded) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#1f2937',
        color: '#fff',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }} onClick={() => setIsExpanded(true)}>
        🔧 Debug Panel
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1f2937',
      color: '#fff',
      padding: '15px',
      borderRadius: '12px',
      fontSize: '12px',
      maxWidth: '380px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'monospace',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid #374151',
        paddingBottom: '8px'
      }}>
        <span style={{ color: '#10b981', fontWeight: 'bold' }}>🔧 Dev Debug Panel</span>
        <button 
          onClick={() => setIsExpanded(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '12px',
        borderBottom: '1px solid #374151'
      }}>
        <button
          onClick={() => setActiveTab('auth')}
          style={{
            background: activeTab === 'auth' ? '#3b82f6' : 'transparent',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '11px',
            marginRight: '4px'
          }}
        >
          🔐 Auth Info
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            background: activeTab === 'roles' ? '#3b82f6' : 'transparent',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '6px 6px 0 0',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          🧪 Role Testing
        </button>
      </div>

      {/* Auth Tab */}
      {activeTab === 'auth' && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Current User:</strong><br />
            UID: {auth.currentUser?.uid || 'None'}<br />
            Email: {firebaseAuth.user?.email || 'None'}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Profile Role:</strong>{' '}
            <span style={{ 
              color: firebaseAuth.profile?.role === 'admin' ? '#10b981' : '#f59e0b',
              fontWeight: 'bold'
            }}>
              {firebaseAuth.profile?.role || 'None'}
            </span>
          </div>

          <button 
            onClick={forceRefreshToken}
            style={{
              padding: '4px 8px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            🔄 Refresh Token
          </button>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Current Role:</strong><br />
            <span style={{ 
              color: user?.role === 'admin' ? '#10b981' : '#f59e0b',
              fontWeight: 'bold'
            }}>
              {user?.role || 'guest'}
            </span>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <strong>Switch To:</strong>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {Object.keys(TEST_CREDENTIALS).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                style={{
                  padding: '4px 8px',
                  background: user?.role === role ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px'
                }}
              >
                {role}
              </button>
            ))}
            <button
              onClick={() => handleRoleSwitch('guest')}
              style={{
                padding: '4px 8px',
                background: !user ? '#ef4444' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              guest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
