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
        } else if (isActive && timeRemaining === 0) {
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
    const circumference = 2 * Math.PI * 60; // 60 é o raio
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <Card 
            className={cn(
                "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl transition-all duration-300 ease-in-out"
            )}
        >
            <CardContent className={cn("p-4 relative transition-all duration-300", isExpanded ? 'h-auto' : 'h-20 flex items-center justify-center')}>
                <div className={cn("grid transition-all duration-300 ease-in-out", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col items-center justify-center w-full space-y-6 py-4 animate-pop-in">
                            <Button onClick={() => setIsExpanded(false)} size="icon" variant="ghost" className="absolute top-2 right-2 w-8 h-8 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700">
                                <ChevronDown size={20} />
                            </Button>
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fb923c" />
                                            <stop offset="100%" stopColor="#f43f5e" />
                                        </linearGradient>
                                    </defs>
                                    <circle cx="50%" cy="50%" r="60" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-zinc-700" fill="transparent" />
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r="60"
                                        stroke="url(#progressGradient)"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                </svg>
                                <div className="relative z-10 text-center">
                                    <span className="text-4xl font-mono font-bold text-gray-800 dark:text-white">
                                        {formatTime(timeRemaining)}
                                    </span>
                                    <p className="text-sm tracking-widest text-gray-500 dark:text-gray-400">FOCO</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400">Selecione uma tarefa para focar.</p>

                            <div className="flex items-center gap-4">
                                <Button onClick={handleTogglePlay} className="bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl px-12 text-base">
                                    {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                                    {isActive ? 'Pausar' : 'Continuar'}
                                </Button>
                                <Button onClick={handleReset} size="icon" variant="ghost" className="w-12 h-12 rounded-full text-gray-400 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600">
                                    <RotateCw size={20} />
                                </Button>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400">Sessões de foco concluídas: {sessions}</p>
                        </div>
                    </div>
                </div>

                {!isExpanded && (
                    <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                        {isActive ? (
                            <div className="flex justify-between items-center w-full px-4 cursor-pointer" onClick={() => setIsExpanded(true)}>
                                <span className="text-sm tracking-widest text-gray-500 dark:text-gray-400">FOCO</span>
                                <span className="text-lg font-mono font-bold text-gray-800 dark:text-white">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleTogglePlay}
                                className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                                aria-label="Iniciar Pomodoro"
                            >
                                <Play size={24} className="ml-1" />
                            </button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}