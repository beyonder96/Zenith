
'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProjectCard, Project, Subtask } from "@/components/projects/project-card";
import { QuickAccessCard } from "@/components/projects/quick-access-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getTaskBreakdown } from '../actions';
import { useRouter } from 'next/navigation';

const initialProjects: Project[] = [
  {
    id: 1,
    title: 'Planejar viagem de férias',
    dueDate: '2025-11-19',
    completed: false,
    subtasks: [],
  },
   {
    id: 2,
    title: 'Organizar festa de aniversário',
    dueDate: '2025-11-25',
    completed: false,
    subtasks: [],
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useLocalStorage<Project[]>('zenith-vision-projects', initialProjects);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<number | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggleComplete = (id: number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const handleDeleteInitiate = (id: number) => {
    setProjectToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete !== null) {
      setProjects(projects.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
      toast({
        title: "Projeto deletado",
        description: "O projeto foi removido com sucesso.",
      });
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/tasks/new?id=${id}`);
  };
  
  const handleAiSplit = async (id: number) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    setLoadingProjectId(id);

    try {
        const result = await getTaskBreakdown(project.title);
        if (result.success && result.subtasks) {
            const newSubtasks: Subtask[] = result.subtasks.map((subtaskText, index) => ({
                id: Date.now() + index,
                text: subtaskText,
                completed: false,
            }));

            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === id
                        ? { ...p, subtasks: [...(p.subtasks || []), ...newSubtasks] }
                        : p
                )
            );
            toast({
                title: "Tarefa dividida!",
                description: "Novas subtarefas foram adicionadas ao projeto.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Falha na divisão com IA",
                description: result.error || "Não foi possível dividir a tarefa.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro de Conexão",
            description: "Não foi possível conectar ao serviço de IA.",
        });
    } finally {
        setLoadingProjectId(null);
    }
  };

  const handleToggleSubtask = (projectId: number, subtaskId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(p => {
        if (p.id === projectId) {
          const updatedSubtasks = p.subtasks?.map(sub =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          return { ...p, subtasks: updatedSubtasks };
        }
        return p;
      })
    );
  };

  return (
    <>
      <div className="relative min-h-screen w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden">
        <div className="relative z-10 flex flex-col h-screen text-gray-800 dark:text-white">
          <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
            <h1 className="text-4xl font-light tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Projetos
            </h1>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
              <div className="w-full max-w-md space-y-4">
                  <QuickAccessCard />
                  {!isClient ? (
                     <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     </div>
                  ) : (
                    projects.map(project => (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isLoading={loadingProjectId === project.id}
                        onToggleComplete={handleToggleComplete}
                        onEdit={handleEdit}
                        onAiSplit={handleAiSplit}
                        onDelete={handleDeleteInitiate}
                        onToggleSubtask={handleToggleSubtask}
                      />
                    ))
                  )}
              </div>
          </main>
          
          <Button asChild className="fixed z-20 bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-100">
            <Link href="/tasks/new">
              <Plus size={32} />
            </Link>
          </Button>
          
          <div className="flex-shrink-0">
            <BottomNav active="produtividade" />
          </div>
        </div>
      </div>

      <AlertDialog open={projectToDelete !== null} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o projeto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
