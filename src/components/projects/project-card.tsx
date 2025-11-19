'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2, Pencil, Sparkles, Trash2 } from "lucide-react";

export function ProjectCard() {
    return (
        <Card className="w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-pink-500"></div>
            <CardContent className="p-4 flex items-center justify-between ml-1.5">
                <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">19</p>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">NOV</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Tarefas</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">19 de novembro de 2025</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
                            <MoreVertical size={20} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/20 text-gray-800 dark:text-white">
                        <DropdownMenuItem className="focus:bg-gray-200/50 dark:focus:bg-white/10">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            <span>Concluir Tarefa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-gray-200/50 dark:focus:bg-white/10">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-gray-200/50 dark:focus:bg-white/10">
                            <Sparkles className="mr-2 h-4 w-4" />
                            <span>Dividir c/ IA</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-white/10" />
                        <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Deletar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}
