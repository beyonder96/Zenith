'use client';

import { Card, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

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
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <MoreVertical size={20} />
                </button>
            </CardContent>
        </Card>
    );
}
