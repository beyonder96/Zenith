'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import type { Project } from '../projects/project-card';
import { BellRing } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Este navegador não suporta notificações de desktop");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

function showNotification(title: string, body: string) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico', // Opcional: adicione um ícone
        });
    }
}


export function NotificationManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [notifiedTasks, setNotifiedTasks] = useState<Set<string>>(new Set());

  // Solicita permissão assim que o componente é montado no cliente
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
          // Usa a notificação nativa do navegador
          showNotification(notificationTitle, notificationDescription);
          newNotifiedTasks.add(taskId);
        }
      });

      setNotifiedTasks(newNotifiedTasks);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore]);

  return null; // This component doesn't render anything
}
