'use client';

import { useState } from 'react';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/project-card";
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

import type { Project, Subtask } from '../types';
import { getTaskBreakdown } from '@/app/actions';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface ProjectsViewProps {
    projects: Project[];
    loading: boolean;
    searchTerm: string;
}

export function ProjectsView({ projects, loading, searchTerm }: ProjectsViewProps) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    const [showDeleteCompletedDialog, setShowDeleteCompletedDialog] = useState(false);
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    const hasCompletedProjects = projects.some(p => p.completed);

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

    const handleDeleteProjectInitiate = (id: string) => {
        setProjectToDelete(id);
    };

    const handleDeleteConfirm = () => {
        if (projectToDelete !== null && firestore) {
          const docRef = doc(firestore, "projects", projectToDelete);
          deleteDoc(docRef).then(() => {
              setProjectToDelete(null);
              toast({ title: "Projeto deletado", description: "O projeto foi removido com sucesso." });
          }).catch(serverError => {
              const permissionError = new FirestorePermissionError({ path: `projects/${projectToDelete}`, operation: 'delete' });
              errorEmitter.emit('permission-error', permissionError);
              setProjectToDelete(null);
          });
        }
    };

    const handleDeleteCompletedConfirm = () => {
        if (!firestore) return;
        const completedProjects = projects.filter(p => p.completed);
        if (completedProjects.length === 0) return;

        const batch = writeBatch(firestore);
        completedProjects.forEach(project => {
            const docRef = doc(firestore, "projects", project.id);
            batch.delete(docRef);
        });

        batch.commit().then(() => {
            toast({ title: "Tarefas concluídas foram limpas." });
            setShowDeleteCompletedDialog(false);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: 'projects', operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            setShowDeleteCompletedDialog(false);
        });
    };
    
    const handleEditProject = (id: string) => {
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
                    toast({ title: "Tarefa dividida!", description: "Novas subtarefas foram adicionadas ao projeto." });
                }).catch(serverError => {
                     const permissionError = new FirestorePermissionError({ path: `projects/${id}`, operation: 'update', requestResourceData: updateData });
                     errorEmitter.emit('permission-error', permissionError);
                });
            } else {
                 toast({ variant: "destructive", title: "Falha na divisão com IA", description: result.error || "Não foi possível dividir a tarefa." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro de Conexão", description: "Não foi possível conectar ao serviço de IA." });
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
                const permissionError = new FirestorePermissionError({ path: `projects/${projectId}`, operation: 'update', requestResourceData: updateData });
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
            {hasCompletedProjects && (
                <div className="mb-4 flex justify-end">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteCompletedDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpar Concluídas
                    </Button>
                </div>
            )}
             <div className="w-full space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Nenhuma tarefa encontrada.</p>
                        {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie sua primeira tarefa.</p>}
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
                            onEdit={handleEditProject}
                            onAiSplit={handleAiSplit}
                            onDelete={handleDeleteProjectInitiate}
                            onToggleSubtask={handleToggleSubtask}
                        />
                    ))
                )}
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
      
            <AlertDialog open={showDeleteCompletedDialog} onOpenChange={setShowDeleteCompletedDialog}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Limpar Tarefas Concluídas?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Esta ação removerá permanentemente todas as tarefas marcadas como concluídas. Você não poderá desfazer isso.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                    onClick={handleDeleteCompletedConfirm}
                    className="bg-destructive hover:bg-destructive/90"
                    >
                    Confirmar e Limpar
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
