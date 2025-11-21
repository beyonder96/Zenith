"use client";

import { useFirestore, useUser } from "@/firebase";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import type { Project } from "@/components/projects/project-card";
import { collection, query, where, onSnapshot } from "firebase/firestore";


export function TasksCard() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (user && firestore) {
            const q = query(collection(firestore, "projects"), where("userId", "==", user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const userProjects: Project[] = [];
                snapshot.forEach(doc => {
                    userProjects.push({ id: doc.id, ...doc.data() } as Project);
                });
                setProjects(userProjects);
            });
            return () => unsubscribe();
        }
    }, [user, firestore]);

    const today = new Date().toISOString().split('T')[0];
    const todayTasks = projects.filter(p => p.dueDate === today);

    return (
        <Card className="bg-card text-card-foreground rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                    <CardTitle className="text-base font-semibold text-card-foreground/90">
                        Tarefas do Dia
                    </CardTitle>
                </div>
                <CheckCircle2 className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
                {!isClient ? (
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-20" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                ) : todayTasks.length > 0 ? (
                    <>
                      <p className="text-2xl font-bold">{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</p>
                      <p className="text-xs text-muted-foreground">concluídas</p>
                    </>
                ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje.</p>
                )}
            </CardContent>
        </Card>
    );
}
