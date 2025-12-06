'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Event } from '../types';
import { EventSchema } from '../types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export function useEvents() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const eventsQuery = query(collection(firestore, "events"), where("userId", "==", user.uid));
            const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
                const userEvents: Event[] = [];
                querySnapshot.forEach((doc) => {
                    try {
                        const validatedEvent = EventSchema.parse({ id: doc.id, ...doc.data() });
                        userEvents.push(validatedEvent);
                    } catch (error) {
                        console.error("Invalid event data:", { id: doc.id, error });
                    }
                });
                setEvents(userEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                setLoading(false);
            },
            (serverError) => {
                const permissionError = new FirestorePermissionError({ path: 'events', operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
            });

            return () => unsubscribeEvents();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, firestore]);

    return { events, loading };
}
