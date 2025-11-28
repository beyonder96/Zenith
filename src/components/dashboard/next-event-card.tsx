'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { differenceInDays, parseISO, isFuture } from 'date-fns';
import { CalendarClock } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import type { Event } from '@/components/events/events';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useSpring, animated } from '@react-spring/web';

function AnimatedNumber({ n }: { n: number }) {
    const { number } = useSpring({
      from: { number: 0 },
      number: n,
      delay: 200,
      config: { mass: 1, tension: 20, friction: 10 },
    });
    return <animated.div>{number.to((val) => Math.floor(val))}</animated.div>;
}

export function NextEventCard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      const todayStr = new Date().toISOString().split('T')[0];
      const q = query(
        collection(firestore, 'events'),
        where('userId', '==', user.uid),
        where('date', '>=', todayStr),
        orderBy('date', 'asc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const eventDoc = snapshot.docs[0];
            setNextEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
          } else {
            setNextEvent(null);
          }
          setLoading(false);
        },
        (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: 'events',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else if (!user) {
        setLoading(false);
    }
  }, [user, firestore]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      );
    }

    if (!nextEvent) {
      return <p className="text-sm text-muted-foreground">Nenhum evento futuro agendado.</p>;
    }
    
    const eventDate = parseISO(nextEvent.date);
    const daysLeft = differenceInDays(eventDate, new Date());

    const daysText = () => {
        if (daysLeft < 0) return "Evento passado";
        if (daysLeft === 0) return "É Hoje!";
        if (daysLeft === 1) return "Falta 1 dia";
        return <>Faltam <AnimatedNumber n={daysLeft} /> dias</>;
    }

    return (
      <div>
        <div className="text-4xl font-bold text-cyan-400 flex items-center gap-1.5">
          {daysLeft >= 1 ? daysText() : "É Hoje!"}
        </div>
        <p className="text-xs text-muted-foreground truncate" title={nextEvent.title}>
          para {nextEvent.title}
        </p>
      </div>
    );
  };

  return (
    <Card className="bg-card text-card-foreground rounded-2xl transition-transform hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground/90">
          Próximo Evento
        </CardTitle>
        <CalendarClock className="text-muted-foreground" size={20} />
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
