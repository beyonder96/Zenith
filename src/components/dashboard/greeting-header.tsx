'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { Switch } from '../ui/switch';
import { useTheme } from 'next-themes';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '../notifications/notification-bell';

const CelestialIcon = ({ type }: { type: 'rising-sun' | 'setting-sun' | 'moon' }) => {
    const typeClasses = {
        'rising-sun': 'rising-sun-icon',
        'setting-sun': 'setting-sun-icon',
        'moon': 'moon-icon',
    };
    return <div className={`celestial-body ${typeClasses[type]}`}></div>;
};

export function GreetingHeader() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [greeting, setGreeting] = useState("Boa noite");
  const [iconType, setIconType] = useState<'rising-sun' | 'setting-sun' | 'moon'>("moon");
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom Dia");
      setIconType("rising-sun");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa Tarde");
      setIconType("setting-sun");
    } else {
      setGreeting("Boa Noite");
      setIconType("moon");
    }
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <CelestialIcon type={iconType} />
        <span className="text-xl font-medium text-foreground">{greeting}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Avatar>
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-background/80 dark:bg-black/40 backdrop-blur-xl border-border text-foreground">
            <DropdownMenuLabel>{user?.displayName || 'Minha Conta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex justify-between items-center focus:bg-accent">
              <div className="flex items-center">
                {isClient && theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                <span>Alterar Tema</span>
              </div>
              {isClient && (
                <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
