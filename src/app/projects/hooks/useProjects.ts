'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Project } from '../types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function useProjects() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const projectsQuery = query(collection(firestore, "projects"), where("userId", "==", user.uid));
            const unsubscribeProjects = onSnapshot(projectsQuery, (querySnapshot) => {
                const userProjects: Project[] = [];
                querySnapshot.forEach((doc) => {
                    userProjects.push({ id: doc.id, ...doc.data() } as Project);
                });
                setProjects(userProjects.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
                setLoading(false);
            },
            (serverError) => {
                const permissionError = new FirestorePermissionError({ path: 'projects', operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
            });

            return () => unsubscribeProjects();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, firestore]);

    return { projects, loading };
}
