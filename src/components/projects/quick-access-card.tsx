'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCw, ChevronDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

export function QuickAccessCard() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const initialTime = 25 * 60; // 25 minutos
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const [sessions, setSessions] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsActive(false);
            setSessions(s => s + 1);
            // Poderia adicionar uma notificação sonora ou visual aqui
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeRemaining]);

    const handleTogglePlay = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        }
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        setTimeRemaining(initialTime);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const progress = (timeRemaining / initialTime) * 100;
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card 
            className={cn(
                "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl transition-all duration-500 ease-in-out",
                isExpanded ? "h-auto" : "h-auto"
            )}
        >
            <CardContent className="p-4 flex items-center justify-center relative">
                {!isExpanded ? (
                    <button 
                        onClick={handleTogglePlay}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                        aria-label="Iniciar Pomodoro"
                    >
                        <Play size={20} className="ml-0.5" />
                    </button>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full space-y-6 py-4">
                        <Button onClick={() => setIsExpanded(false)} size="icon" variant="ghost" className="absolute top-2 right-2 w-8 h-8 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700">
                            <ChevronDown size={20} />
                        </Button>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="absolute w-full h-full transform -rotate-90">
                                <circle cx="50%" cy="50%" r="52" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-zinc-700" fill="transparent" />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="52"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full" style={{ transform: `rotate(${((initialTime - timeRemaining) / initialTime) * 360}deg) translateY(-56px)` }}></div>
                            <div className="text-center">
                                <span className="text-4xl font-mono font-bold text-gray-800 dark:text-white">
                                    {formatTime(timeRemaining)}
                                </span>
                                <p className="text-sm tracking-widest text-gray-500 dark:text-gray-400">FOCO</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">Selecione uma tarefa para focar.</p>

                        <div className="flex items-center gap-4">
                             <Button onClick={handleTogglePlay} className="bg-pink-500 hover:bg-pink-600 text-white font-bold h-12 rounded-xl px-12 text-base">
                                {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                                {isActive ? 'Pausar' : 'Continuar'}
                            </Button>
                            <Button onClick={handleReset} size="icon" variant="ghost" className="w-12 h-12 rounded-full text-gray-400 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                                <RotateCw size={20} />
                            </Button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">Sessões de foco concluídas: {sessions}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
