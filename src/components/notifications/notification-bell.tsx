'use client';

import { Bell, MailCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/context/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationBell() {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificações
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); markAsRead(); }}
              disabled={unreadCount === 0}
              className="h-7"
            >
              <MailCheck className="h-4 w-4 mr-1" /> Marcar como lidas
            </Button>
             <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
              disabled={notifications.length === 0}
              className="h-7 w-7 text-red-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <DropdownMenuItem disabled>Nenhuma notificação por aqui.</DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex-col items-start gap-1" onSelect={(e) => e.preventDefault()}>
                {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                <div className="font-semibold text-sm">{notification.title}</div>
                <div className="text-xs text-muted-foreground">{notification.body}</div>
                <div className="text-xs text-muted-foreground/80 mt-1">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
