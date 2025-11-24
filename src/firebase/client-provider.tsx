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

// Singleton instances
let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;

function getFirebaseInstances() {
  if (!firebaseApp) {
    // Always initialize for production.
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export function FirebaseClientProvider({ children }: Props) {
  const [app, setApp] = useState<FirebaseApp | undefined>();
  const [appAuth, setAppAuth] = useState<Auth | undefined>();
  const [appFirestore, setAppFirestore] = useState<Firestore | undefined>();

  useEffect(() => {
    // This effect runs only once on the client, ensuring single initialization.
    const instances = getFirebaseInstances();
    setApp(instances.firebaseApp);
    setAppAuth(instances.auth);
    setAppFirestore(instances.firestore);
  }, []);

  if (!app || !appAuth || !appFirestore) {
    // Render nothing until Firebase is initialized on the client.
    // This can be replaced with a loading spinner if desired.
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
