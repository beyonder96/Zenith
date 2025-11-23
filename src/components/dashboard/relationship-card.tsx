'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { differenceInDays, intervalToDuration, formatDuration } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSpring, animated } from '@react-spring/web';
import { cn } from '@/lib/utils';

interface RelationshipCardProps {
  title: string;
  icon: React.ElementType;
  storageKey: string;
  unit: 'days' | 'full';
}

function AnimatedNumber({ n }: { n: number }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: n,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  return <animated.div>{number.to((val) => Math.floor(val))}</animated.div>;
}

export function RelationshipCard({ title, icon: Icon, storageKey, unit }: RelationshipCardProps) {
  const [storedDate, setStoredDate] = useLocalStorage<string | null>(storageKey, null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const selectedDate = storedDate ? new Date(storedDate) : null;

  const calculateTime = () => {
    if (!selectedDate) return { display: null, subtext: null };

    if (unit === 'days') {
      const days = differenceInDays(new Date(), selectedDate);
      return { display: <AnimatedNumber n={days} />, subtext: 'dias de felicidade' };
    }

    const duration = intervalToDuration({ start: selectedDate, end: new Date() });
    
    // Custom format to avoid zero values
    const parts = [
      duration.years && `${duration.years}a`,
      duration.months && `${duration.months}m`,
      duration.days && `${duration.days}d`
    ].filter(Boolean);

    if (parts.length === 0) {
      return { display: 0, subtext: 'Hoje!' };
    }

    return { 
      display: parts.join(' '),
      subtext: 'de história juntos' 
    };
  };

  const { display, subtext } = calculateTime();
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setStoredDate(date.toISOString());
      setIsPopoverOpen(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground rounded-2xl relative overflow-hidden group">
      <CardHeader className="flex flex-row items-start justify-between pb-2 z-10 relative">
        <div className="flex flex-col">
          <CardTitle className="text-base font-semibold text-card-foreground/90">
            {title}
          </CardTitle>
        </div>
        <Icon className="text-pink-400/80" size={20} />
      </CardHeader>
      <CardContent className="z-10 relative">
        {selectedDate ? (
          <>
            <div className={cn("text-3xl font-bold", unit === 'full' && 'text-2xl')}>
                {display}
            </div>
            <p className="text-xs text-muted-foreground">{subtext}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Defina uma data para começar.</p>
        )}
      </CardContent>
       <div className="absolute bottom-2 right-2 z-10">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity">
              <Settings size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              initialFocus
              locale={ptBR}
              captionLayout="dropdown-buttons"
              fromYear={1970}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-tr from-orange-400/20 via-pink-500/20 to-rose-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
    </Card>
  );
}
