"use client";

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DateSelector() {
  const [dates, setDates] = useState<{ day: string; date: string; fullDate: Date }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const startOfWeek = today; // Show today and next 6 days
    const weekDates = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek, i-2); // Center today
      return {
        day: format(date, 'EEE', { locale: ptBR }).toUpperCase(),
        date: format(date, 'd'),
        fullDate: date,
      };
    });
    setDates(weekDates);
    setSelectedDate(today);
  }, []);

  return (
    <div className="flex justify-between items-center bg-card p-2 rounded-xl">
      {dates.map(({ day, date, fullDate }) => {
        const isSelected = isSameDay(fullDate, selectedDate);
        return (
          <button
            key={date}
            onClick={() => setSelectedDate(fullDate)}
            className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg transition-colors
              ${isSelected ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white' : 'text-muted-foreground'}`
            }
          >
            <span className="text-xs">{day}</span>
            <span className="text-lg font-bold">{date}</span>
          </button>
        );
      })}
    </div>
  );
}
