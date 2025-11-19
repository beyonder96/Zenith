'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2, Pencil, Sparkles, Trash2, Circle } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";

export type Project = {
    id: number;
    title: string;
    dueDate: string; // YYYY-MM-DD
    completed: boolean;
};

type ProjectCardProps = {
    project: Project;
    onToggleComplete: (id: number) => void;
    onEdit: (id: number) => void;
    onAiSplit: (id: number) => void;
    onDelete: (id: number) => void;
};

export function ProjectCard({ project, onToggleComplete, onEdit, onAiSplit, onDelete }: ProjectCardProps) {
    const date = parseISO(project.dueDate);
    const day = format(date, 'd');
    const month = format(date, 'MMM', { locale: ptBR }).toUpperCase();
    const fullDate = format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
        <Card className={cn(
            "w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl relative overflow-hidden transition-all",
            project.completed && "opacity-50"
        )}>
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                project.completed ? "bg-green-500" : "bg-gradient-to-b from-orange-400 to-pink-500"
            )}></div>
            <CardContent className="p-4 flex items-center justify-between ml-1.5">
                <div className="flex items-center gap-4">
                    <div className="text-center w-12">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                                <MoreVertical size={20} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 text-gray-800 dark:text-white">
                            <DropdownMenuItem onSelect={() => onAiSplit(project.id)} className="focus:bg-gray-200/50 dark:focus:bg-white/10">
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span>Dividir c/ IA</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-white/10" />
                            <DropdownMenuItem onSelect={() => onDelete(project.id)} className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Deletar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}
