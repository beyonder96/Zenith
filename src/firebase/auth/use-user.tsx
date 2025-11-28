'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '@/firebase';

export const useUser = () => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!auth || !isClient) {
      // Defer auth state observation until on the client and auth is available
      if (isClient) {
        setLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, isClient]);

  // Return a loading state that accounts for both client hydration and auth state
  return { user, loading: loading || !isClient };
};
