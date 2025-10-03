"use client";

import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { EmailVerificationNotice } from './email-verification-notice';

export function GlobalEmailVerification() {
  const { user: authUser } = useAuth();
  const [firebaseUser, setFirebaseUser] = React.useState<User | null>(null);

  // Listen to Firebase Auth state to get email verification status
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Only show for authenticated users with unverified emails
  if (!authUser || !firebaseUser || firebaseUser.emailVerified) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="container mx-auto">
        <EmailVerificationNotice
          user={firebaseUser}
          variant="minimal"
          showIcon={true}
          className="text-center"
        />
      </div>
    </div>
  );
}

export default GlobalEmailVerification;