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
  const [taskHistory] = useLocalStorage<TaskHistory>("zenith-vision-tasks-v2", {
      [getTodayString()]: [
          {id: 1, text: "Reunião de equipe", completed: true},
          {id: 2, text: "Finalizar relatório", completed: false},
          {id: 3, text: "Ligar para o cliente", completed: false},
      ]
  });

  const today = getTodayString();
  const todayTasks = taskHistory[today] || [];
  const completedTasks = todayTasks.filter(task => task.completed).length;

  return (
    <Card className="bg-black/20 border border-white/10 rounded-2xl backdrop-blur-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
              Tarefas
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">{completedTasks}/{todayTasks.length}</CardDescription>
        </div>
         <div className="p-2 bg-white/10 rounded-lg">
            <CheckCircle2 className="text-white" size={20} />
         </div>
      </CardHeader>
      <CardContent>
       <p className="text-xs text-muted-foreground">tarefas concluídas</p>
      </CardContent>
    </Card>
  );
}
