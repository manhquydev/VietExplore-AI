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