'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import type { Project } from '../projects/project-card';
import { useNotifications } from '@/context/notification-context';

export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && "Notification" in window) {
    if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
}

function showNotification(title: string, body: string) {
    if (typeof window !== 'undefined' && "Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
            });
        }
    }
}

export function NotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());
  const { addNotification } = useNotifications();

  useEffect(() => {
    // A permissão agora é solicitada no login
    // Apenas mantemos o listener do Firestore aqui
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
          return; 
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
          // Apenas adiciona ao centro de notificações interno do app.
          addNotification({
            id: `task-${taskId}-${Date.now()}`,
            title: notificationTitle,
            body: notificationDescription,
          });
          newNotifiedTasks.add(taskId);
        }
      });

      setNotifiedTasks(newNotifiedTasks);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore, addNotification]);

  return null;
}
