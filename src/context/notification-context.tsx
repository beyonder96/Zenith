'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string; // ISO 8601 string
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'> & {id?: string}) => void;
  markAsRead: (id?: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('app-notifications', []);

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'read' | 'timestamp'> & {id?: string}) => {
    const newNotification: AppNotification = {
      id: notification.id || `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, [setNotifications]);

  const markAsRead = useCallback((id?: string) => {
    setNotifications(prev => 
      prev.map(n => 
        (id ? n.id === id : !n.read) ? { ...n, read: true } : n
      )
    );
  }, [setNotifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
