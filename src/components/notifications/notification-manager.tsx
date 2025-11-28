'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import type { Project } from '../projects/project-card';
import { BellRing } from 'lucide-react';

export function NotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !firestore) return;

    const projectsQuery = query(
      collection(firestore, 'projects'),
      where('userId', '==', user.uid),
      where('completed', '==', false)
    );

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const newNotifiedTasks = new Set(notifiedTasks);
      
      snapshot.forEach((doc) => {
        const project = { id: doc.id, ...doc.data() } as Project;
        const dueDate = parseISO(project.dueDate);
        const taskId = project.id;

        if (notifiedTasks.has(taskId)) {
          return; // Already notified for this task in this session
        }

        let notificationTitle = '';
        let notificationDescription = '';

        if (isToday(dueDate)) {
          notificationTitle = `Tarefa para Hoje: ${project.title}`;
          notificationDescription = 'Esta tarefa vence hoje. Não se esqueça!';
        } else if (isTomorrow(dueDate)) {
          notificationTitle = `Tarefa para Amanhã: ${project.title}`;
          notificationDescription = 'Prepare-se, esta tarefa vence amanhã.';
        }

        if (notificationTitle) {
          setTimeout(() => {
            toast({
              title: notificationTitle,
              description: notificationDescription,
              action: <BellRing className="text-foreground" />,
            });
            newNotifiedTasks.add(taskId);
          }, 1000); // Small delay to avoid toast spam on load
        }
      });

      setNotifiedTasks(newNotifiedTasks);
    });

    return () => unsubscribe();
    // We only want to run this on user/firestore changes, not on every toast change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  return null; // This component doesn't render anything
}
