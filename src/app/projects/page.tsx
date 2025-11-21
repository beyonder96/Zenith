
'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProjectCard, Project, Subtask } from "@/components/projects/project-card";
import { QuickAccessCard } from "@/components/projects/quick-access-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function ProjectsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const q = query(collection(firestore, "projects"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          userProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(userProjects.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'projects',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribe();
    }
  }, [user, firestore]);

  const handleToggleComplete = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !firestore) return;
    const projectRef = doc(firestore, "projects", id);
    const updateData = { completed: !project.completed };
    updateDoc(projectRef, updateData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: `projects/${id}`,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };

  const handleDeleteInitiate = (id: string) => {
    setProjectToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete !== null && firestore) {
      const docRef = doc(firestore, "projects", projectToDelete);
      deleteDoc(docRef).then(() => {
          setProjectToDelete(null);
          toast({
            title: "Projeto deletado",
            description: "O projeto foi removido com sucesso.",
          });
      }).catch(serverError => {
          const permissionError = new FirestorePermissionError({
              path: `projects/${projectToDelete}`,
              operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
          setProjectToDelete(null);
      });
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/tasks/new?id=${id}`);
  };
  
  const handleAiSplit = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !firestore) return;

    setLoadingProjectId(id);

    try {
        const result = await getTaskBreakdown(project.title);
        if (result.success && result.subtasks) {
            const newSubtasks: Subtask[] = result.subtasks.map((subtaskText) => ({
                id: Date.now() + Math.random(),
                text: subtaskText,
                completed: false,
            }));
            
            const projectRef = doc(firestore, "projects", id);
            const updateData = { subtasks: [...(project.subtasks || []), ...newSubtasks] };

            updateDoc(projectRef, updateData).then(() => {
                handleToggleExpand(id, true);
                toast({
                    title: "Tarefa dividida!",
                    description: "Novas subtarefas foram adicionadas ao projeto.",
                });
            }).catch(serverError => {
                 const permissionError = new FirestorePermissionError({
                    path: `projects/${id}`,
                    operation: 'update',
                    requestResourceData: updateData
                });
                errorEmitter.emit('permission-error', permissionError);
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

  const handleToggleSubtask = (projectId: string, subtaskId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || !firestore) return;

    const updatedSubtasks = project.subtasks?.map(sub =>
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    
    const projectRef = doc(firestore, "projects", projectId);
    const updateData = { subtasks: updatedSubtasks };
    updateDoc(projectRef, updateData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: `projects/${projectId}`,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  };
  
  const handleToggleExpand = (id: string, forceOpen = false) => {
    setExpandedProjects(prev => {
        const newSet = new Set(prev);
        if (forceOpen) {
            newSet.add(id);
        } else if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
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
                  ) : projects.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>Nenhum projeto ainda.</p>
                      <p className="text-sm">Clique em '+' para criar seu primeiro projeto.</p>
                    </div>
                  ) : (
                    projects.map(project => (
                      <ProjectCard 
                        key={project.id}
                        project={project}
                        isLoading={loadingProjectId === project.id}
                        isExpanded={expandedProjects.has(project.id)}
                        onToggleExpand={handleToggleExpand}
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
