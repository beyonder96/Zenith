'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Note } from '../types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function useNotes() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const notesQuery = query(collection(firestore, "notes"), where("userId", "==", user.uid));
            const unsubscribeNotes = onSnapshot(notesQuery, (querySnapshot) => {
                const userNotes: Note[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    userNotes.push({ 
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
                    } as Note);
                });
                setNotes(userNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                setLoading(false);
            },
            (serverError) => {
                const permissionError = new FirestorePermissionError({ path: 'notes', operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
            });

            return () => unsubscribeNotes();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, firestore]);

    return { notes, loading };
}
