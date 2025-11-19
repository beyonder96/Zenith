"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                    <CardTitle className="text-base font-semibold text-white/90">
                        Tarefas do Dia
                    </CardTitle>
                </div>
                <CheckCircle2 className="text-white/60" size={20} />
            </CardHeader>
            <CardContent>
                {todayTasks.length > 0 ? (
                    <>
                      <p className="text-2xl font-bold">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</p>
                      <p className="text-xs text-white/70">concluídas</p>
                    </>
                ) : (
                    <p className="text-sm text-white/70">Nenhuma tarefa para hoje.</p>
                )}
            </CardContent>
        </Card>
    );
}
