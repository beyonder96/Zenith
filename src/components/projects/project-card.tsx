'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle, Loader2, Pencil, Sparkles, Trash2, ChevronDown, AlignLeft } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export type Subtask = {
    id: number;
    text: string;
    completed: boolean;
};

export type Project = {
    id: string;
    title: string;
    details?: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
    subtasks?: Subtask[];
    userId: string;
};

type ProjectCardProps = {
    project: Project;
    isLoading: boolean;
    isExpanded: boolean;
    onToggleComplete: (id: string) => void;
    onEdit: (id: string) => void;
    onAiSplit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleSubtask: (projectId: string, subtaskId: number) => void;
    onToggleExpand: (id: string) => void;
};

export function ProjectCard({ 
    project, 
    isLoading, 
    isExpanded,
    onToggleComplete, 
    onEdit, 
    onAiSplit, 
    onDelete, 
    onToggleSubtask,
    onToggleExpand
}: ProjectCardProps) {
    const date = parseISO(project.dueDate);
    const day = format(date, 'd');
    const month = format(date, 'MMM', { locale: ptBR }).toUpperCase();
    const fullDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const hasSubtasks = project.subtasks && project.subtasks.length > 0;
    const hasDetails = project.details && project.details.trim().length > 0;

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
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                        <div className="text-center w-12 flex-shrink-0">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{day}</p>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{month}</p>
                        </div>
                        <div className="flex-grow min-w-0 pt-1">
                            <p className={cn("font-semibold text-gray-800 dark:text-white truncate", project.completed && "line-through")}>
                                {project.title}
                            </p>
                            <div className="flex items-center gap-2">
                               <p className="text-sm text-gray-500 dark:text-gray-400">{fullDate}</p>
                               {hasDetails && <AlignLeft size={14} className="text-gray-400" />}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {(hasSubtasks || hasDetails) && (
                            <button onClick={() => onToggleExpand(project.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                                <ChevronDown size={20} className={cn("transition-transform duration-300", isExpanded && "rotate-180")} />
                            </button>
                        )}
                        <button onClick={() => onToggleComplete(project.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                           {project.completed ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-gray-400" />}
                        </button>
                    </div>
                </div>

                <div className="pl-16 flex items-center justify-end gap-1 pt-2">
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

                <div 
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 pl-16 space-y-3">
                            {hasDetails && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{project.details}</p>
                            )}
                            {hasSubtasks && (
                                <div className="space-y-3 pt-2">
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
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
