"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

type TaskHistory = {
    [date: string]: Task[];
}

export function TasksCard() {
    const [taskHistory] = useLocalStorage<TaskHistory>("zenith-vision-tasks-v2", {});

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = taskHistory[today] || [];

    return (
        <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
                        Tarefas do Dia
                    </CardTitle>
                </div>
                <div className="p-2 bg-zinc-800 rounded-lg">
                    <CheckCircle2 className="text-white" size={20} />
                </div>
            </CardHeader>
            <CardContent>
                {todayTasks.length > 0 ? (
                    <p className="text-2xl font-bold text-white">{todayTasks.filter(t => t.completed).length}/{todayTasks.length} concluídas</p>
                ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
                )}
            </CardContent>
        </Card>
    );
}
