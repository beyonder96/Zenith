"use client";

import { useState, useTransition } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ListTodo, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getTaskSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

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
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory>("zenith-vision-tasks", {});
  const [newTask, setNewTask] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const today = getTodayString();
  const todayTasks = taskHistory[today] || [];

  const updateTodayTasks = (tasks: Task[]) => {
      setTaskHistory(prev => ({ ...prev, [today]: tasks }));
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      updateTodayTasks([...todayTasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
      setNewTask("");
    }
  };

  const handleToggleTask = (id: number) => {
    const updatedTasks = todayTasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTodayTasks(updatedTasks);
  };

  const handleDeleteTask = (id: number) => {
    updateTodayTasks(todayTasks.filter((task) => task.id !== id));
  };
  
  const handleSuggestTasks = () => {
    startTransition(async () => {
      // Don't include today's tasks in history for suggestion
      const historyToSuggest = { ...taskHistory };
      delete historyToSuggest[today];

      const historicalDataString = JSON.stringify(historyToSuggest);
      const result = await getTaskSuggestions(historicalDataString, 3);
      
      if (result.success && result.tasks) {
        const newTasks = result.tasks.map(text => ({ id: Date.now() + Math.random(), text, completed: false }));
        // Avoid adding duplicate tasks
        const uniqueNewTasks = newTasks.filter(newTask => !todayTasks.some(existingTask => existingTask.text.toLowerCase() === newTask.text.toLowerCase()));
        updateTodayTasks([...todayTasks, ...uniqueNewTasks]);
        toast({
          title: "Tasks Suggested",
          description: `${uniqueNewTasks.length} new tasks have been added to your list.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Suggestion Failed",
          description: result.error || "Could not generate task suggestions.",
        });
      }
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <ListTodo className="text-accent" />
          Daily Tasks
        </CardTitle>
        <CardDescription>Manage your tasks for the day.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus />
          </Button>
        </form>
        <Separator />
        <ScrollArea className="flex-grow h-64">
          <div className="pr-4">
            {todayTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tasks for today. Try suggesting some!</p>
            ) : (
              <ul className="space-y-3">
                {todayTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 transition-all animate-in fade-in-0 slide-in-from-top-2 duration-300 group">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={task.text}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className={`flex-grow text-sm cursor-pointer transition-colors ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.text}
                    </label>
                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteTask(task.id)} aria-label={`Delete ${task.text}`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button onClick={handleSuggestTasks} disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Sparkles className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Thinking...' : 'Suggest Tasks with AI'}
        </Button>
      </CardFooter>
    </Card>
  );
}
