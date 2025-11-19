'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCw } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function QuickAccessCard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const initialTime = 25 * 60; // 25 minutos
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (!isActive && timeRemaining !== 0) {
            if (interval) clearInterval(interval);
        } else if (timeRemaining === 0) {
            setIsActive(false);
            // Poderia adicionar uma notificação sonora ou visual aqui
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeRemaining]);

    const handleToggle = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeRemaining(initialTime);
        setIsExpanded(false);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <Card 
            className={cn(
                "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl transition-all duration-300 ease-in-out",
                isExpanded ? "h-28" : "h-auto"
            )}
        >
            <CardContent className="p-4 flex items-center justify-center h-full">
                {!isExpanded ? (
                    <button 
                        onClick={handleToggle}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                        aria-label="Iniciar Pomodoro"
                    >
                        <Play size={20} className="ml-0.5" />
                    </button>
                ) : (
                    <div className="flex items-center justify-between w-full h-full px-4">
                        <span className="text-5xl font-mono font-bold text-gray-800 dark:text-white">
                            {formatTime(timeRemaining)}
                        </span>
                        <div className="flex items-center gap-2">
                             <Button onClick={handleToggle} size="icon" variant="ghost" className="w-12 h-12 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700">
                                {isActive ? <Pause size={24} /> : <Play size={24} />}
                            </Button>
                            <Button onClick={handleReset} size="icon" variant="ghost" className="w-12 h-12 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700">
                                <RotateCw size={20} />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
