'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, MapPin, Clock } from "lucide-react";
import { format, parseISO, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Event } from "./events";
import { Button } from "../ui/button";

type EventCardProps = {
    event: Event;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
    const date = parseISO(event.date);
    const day = format(date, 'd');
    const month = format(date, 'MMM', { locale: ptBR }).toUpperCase();
    const fullDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

    const hasPassed = isPast(date) && !isToday(date);

    return (
        <Card className={cn(
            "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl relative overflow-hidden transition-opacity",
             hasPassed && "opacity-60"
        )}>
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-purple-500"></div>
            <CardContent className="p-4 ml-1.5">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                        <div className="text-center w-12 flex-shrink-0">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{day}</p>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{month}</p>
                        </div>
                        <div className="flex-grow min-w-0 pt-1">
                            <p className="font-semibold text-gray-800 dark:text-white truncate">
                                {event.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{fullDate}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-0 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(event.id)} className="h-8 w-8 text-gray-500">
                           <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10">
                           <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                {(event.time || event.location) && (
                    <div className="pl-16 pt-2 space-y-1">
                        {event.time && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock size={14} />
                                <span>{event.time}</span>
                            </div>
                        )}
                        {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <MapPin size={14} />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                )}
                 {event.description && (
                    <div className="pl-16 pt-3 mt-3 border-t border-gray-200 dark:border-zinc-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
