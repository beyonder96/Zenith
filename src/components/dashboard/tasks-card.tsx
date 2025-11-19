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

const getTodayString = () => new Date().toISOString().split('T')[0];

export function TasksCard() {
  const [taskHistory] = useLocalStorage<TaskHistory>("zenith-vision-tasks", {});

  const today = getTodayString();
  const todayTasks = taskHistory[today] || [];
  const hasTasks = todayTasks.length > 0;

  return (
    <Card className="bg-card border-none rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Tarefas do Dia
            </CardTitle>
            {!hasTasks && (
                <CardDescription>Nenhuma tarefa para hoje.</CardDescription>
            )}
        </div>
        <CheckCircle2 className="text-muted-foreground" size={20} />
      </CardHeader>
      <CardContent>
       {/* Future content for tasks can go here. */}
      </CardContent>
    </Card>
  );
}
