'use client';

import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';
import { firebaseConfig } from './config';

interface Props {
  children: ReactNode;
}

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function getFirebaseInstances() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export function FirebaseClientProvider({ children }: Props) {
  const [app, setApp] = useState(firebaseApp);
  const [appAuth, setAppAuth] = useState(auth);
  const [appFirestore, setAppFirestore] = useState(firestore);

  useEffect(() => {
    const instances = getFirebaseInstances();
    setApp(instances.firebaseApp);
    setAppAuth(instances.auth);
    setAppFirestore(instances.firestore);
  }, []);

  if (!app || !appAuth || !appFirestore) {
    return null; 
  }

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={appAuth}
      firestore={appFirestore}
    >
      {children}
    </FirebaseProvider>
  );
}
