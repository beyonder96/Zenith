'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle, Loader2, Pencil, Sparkles, Trash2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export type Subtask = {
    id: number;
    text: string;
    completed: boolean;
};

export type Project = {
    id: number;
    title: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
    subtasks?: Subtask[];
};

type ProjectCardProps = {
    project: Project;
    isLoading: boolean;
    onToggleComplete: (id: number) => void;
    onEdit: (id: number) => void;
    onAiSplit: (id: number) => void;
    onDelete: (id: number) => void;
    onToggleSubtask: (projectId: number, subtaskId: number) => void;
};

export function ProjectCard({ project, isLoading, onToggleComplete, onEdit, onAiSplit, onDelete, onToggleSubtask }: ProjectCardProps) {
    const date = parseISO(project.dueDate);
    const day = format(date, 'd');
    const month = format(date, 'MMM', { locale: ptBR }).toUpperCase();
    const fullDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
        <Card className={cn(
            "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl relative overflow-hidden transition-all",
            project.completed && "opacity-60"
        )}>
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                project.completed ? "bg-green-500" : "bg-gradient-to-b from-orange-400 to-pink-500"
            )}></div>
            <CardContent className="p-4 ml-1.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-center w-12 flex-shrink-0">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{day}</p>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{month}</p>
                        </div>
                        <div>
                            <p className={cn("font-semibold text-gray-800 dark:text-white", project.completed && "line-through")}>
                                {project.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{fullDate}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => onToggleComplete(project.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                           {project.completed ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-400" />}
                        </button>
                        <button onClick={() => onEdit(project.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Pencil size={18} />
                        </button>
                        <button onClick={() => onAiSplit(project.id)} disabled={isLoading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </button>
                        <button onClick={() => onDelete(project.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {project.subtasks && project.subtasks.length > 0 && (
                    <div className="mt-4 pl-16 space-y-3">
                        {project.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center gap-3">
                                <Checkbox
                                    id={`subtask-${subtask.id}`}
                                    checked={subtask.completed}
                                    onCheckedChange={() => onToggleSubtask(project.id, subtask.id)}
                                    className="border-gray-400"
                                />
                                <label
                                    htmlFor={`subtask-${subtask.id}`}
                                    className={cn(
                                        "text-sm font-medium leading-none text-gray-600 dark:text-gray-300",
                                        subtask.completed && "line-through text-gray-400 dark:text-gray-500"
                                    )}
                                >
                                    {subtask.text}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
