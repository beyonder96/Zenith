"use client";

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const dayAbbreviations: { [key: string]: string } = {
  dom: 'DOM',
  seg: 'SEG',
  ter: 'TER',
  qua: 'QUA',
  qui: 'QUI',
  sex: 'SEX',
  sáb: 'SÁB',
};

export function DateSelector() {
  const [dates, setDates] = useState<{ day: string; date: string; fullDate: Date }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    // Adjust to make the week start on Sunday for `date-fns` logic
    const startOfWeek = addDays(today, -today.getDay()); 

    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek, i);
      // Get the abbreviated day name key (e.g., 'seg', 'ter')
      const dayNameKey = format(date, 'EEE', { locale: ptBR }).replace('.', '').toLowerCase();
      // Use the map to get the uppercase abbreviation
      const dayName = dayAbbreviations[dayNameKey] || dayNameKey.toUpperCase();
      return {
        day: dayName,
        date: format(date, 'd'),
        fullDate: date,
      };
    });
    setDates(weekDates);
    setSelectedDate(today);
  }, []);

  return (
    <div className="flex justify-between items-center bg-zinc-900 p-2 rounded-xl border border-zinc-800">
      {dates.map(({ day, date, fullDate }) => {
        const isSelected = isSameDay(fullDate, selectedDate);
        const isCurrentDay = isToday(fullDate);

        return (
          <button
            key={date}
            onClick={() => setSelectedDate(fullDate)}
            className={cn(
                `flex flex-col items-center justify-center w-12 h-16 rounded-lg transition-all duration-300`,
                isSelected 
                    ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg scale-105' 
                    : 'text-muted-foreground hover:bg-zinc-800',
                isCurrentDay && !isSelected && 'border border-zinc-700'
            )}
          >
            <span className="text-xs font-medium">{day}</span>
            <span className="text-xl font-bold">{date}</span>
          </button>
        );
      })}
    </div>
  );
}
