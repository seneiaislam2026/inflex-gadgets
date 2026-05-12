import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.ts';
import { useAuthStore } from '../store/authStore.ts';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAuthReady } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          const isAdminEmail = firebaseUser.email?.toLowerCase() === 'admin@inflex.com' || firebaseUser.email?.toLowerCase() === 'seneiaislam@gmail.com';
          let isAdmin = isAdminEmail;
          if (userDocSnap.exists()) {
            isAdmin = isAdmin || userDocSnap.data()?.role === 'admin';
          }
          
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            isAdmin,
          });
        } catch (error) {
          console.error("Error fetching user data", error);
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            isAdmin: false,
          });
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [setUser, setAuthReady]);

  return <>{children}</>;
}
