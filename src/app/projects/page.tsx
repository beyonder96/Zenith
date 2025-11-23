
'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProjectCard, Project, Subtask } from "@/components/projects/project-card";
import { QuickAccessCard } from "@/components/projects/quick-access-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, StickyNote, ListTodo, Edit, Trash2, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { getTaskBreakdown } from '../actions';
import { useRouter } from 'next/navigation';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import type { Note } from '@/components/notes/notes';
import { NoteCard } from '@/components/notes/note-card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState<'projects' | 'notes'>('projects');

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      // Projects listener
      const projectsQuery = query(collection(firestore, "projects"), where("userId", "==", user.uid));
      const unsubscribeProjects = onSnapshot(projectsQuery, (querySnapshot) => {
        const userProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          userProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(userProjects.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({ path: 'projects', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      // Notes listener
      const notesQuery = query(collection(firestore, "notes"), where("userId", "==", user.uid));
      const unsubscribeNotes = onSnapshot(notesQuery, (querySnapshot) => {
        const userNotes: Note[] = [];
        querySnapshot.forEach((doc) => {
          userNotes.push({ id: doc.id, ...doc.data() } as Note);
        });
        setNotes(userNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({ path: 'notes', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      return () => {
        unsubscribeProjects();
        unsubscribeNotes();
      };
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

  const handleDeleteProjectInitiate = (id: string) => {
    setProjectToDelete(id);
  };
  
  const handleDeleteNoteInitiate = (id: string) => {
    setViewingNote(null); // Fecha o modal de visualização
    setTimeout(() => setNoteToDelete(id), 150); // Dá tempo para o modal fechar
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
    if (noteToDelete !== null && firestore) {
        const docRef = doc(firestore, "notes", noteToDelete);
        deleteDoc(docRef).then(() => {
            setNoteToDelete(null);
            toast({ title: "Nota deletada", description: "A nota foi removida com sucesso." });
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: `notes/${noteToDelete}`, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            setNoteToDelete(null);
        });
    }
  };

  const handleEditProject = (id: string) => {
    router.push(`/tasks/new?id=${id}`);
  };

  const handleEditNote = (id: string) => {
    setViewingNote(null);
    router.push(`/notes/new?id=${id}`);
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
      <div className="relative min-h-screen w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden">
        <div className="relative z-10 flex flex-col h-screen text-gray-800 dark:text-white">
          <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
            <h1 className="text-4xl font-light tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Produtividade
            </h1>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
              <div className="w-full max-w-md">
                 <div className="flex w-full items-center justify-center gap-2 mb-4">
                  <Button
                    onClick={() => setActiveView('projects')}
                    variant={activeView === 'projects' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-6 transition-all',
                      activeView === 'projects' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Projetos
                  </Button>
                  <Button
                    onClick={() => setActiveView('notes')}
                    variant={activeView === 'notes' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-6 transition-all',
                      activeView === 'notes' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Notas
                  </Button>
                </div>
                {activeView === 'projects' && (
                  <div className="w-full space-y-4">
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
                            onEdit={handleEditProject}
                            onAiSplit={handleAiSplit}
                            onDelete={handleDeleteProjectInitiate}
                            onToggleSubtask={handleToggleSubtask}
                          />
                        ))
                      )}
                  </div>
                )}
                {activeView === 'notes' && (
                    <div className="w-full space-y-4">
                         {!isClient ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                            <p>Nenhuma nota ainda.</p>
                            <p className="text-sm">Clique em '+' para criar sua primeira nota.</p>
                            </div>
                        ) : (
                           <div className="columns-2 gap-4">
                             {notes.map(note => (
                                <NoteCard 
                                    key={note.id}
                                    note={note}
                                    onView={() => setViewingNote(note)}
                                />
                            ))}
                           </div>
                        )}
                    </div>
                )}
              </div>
          </main>
          
          <div className="fixed z-20 bottom-28 right-6 flex items-center gap-2">
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/tasks/new">
                    <ListTodo className="mr-2 h-4 w-4" /> Nova Tarefa
                </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/notes/new">
                    <StickyNote className="mr-2 h-4 w-4" /> Nova Nota
                </Link>
            </Button>
          </div>
          
          <div className="flex-shrink-0">
            <BottomNav active="produtividade" />
          </div>
        </div>
      </div>

      <Dialog open={viewingNote !== null} onOpenChange={(open) => !open && setViewingNote(null)}>
        {viewingNote && (
          <DialogContent 
            className={cn("max-w-md w-full p-0 border-none", viewingNote.color || 'bg-card')}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            <div className='p-6 flex flex-col'>
              <DialogHeader className="flex flex-row justify-between items-start pr-0">
                <DialogTitle className="text-2xl font-bold pr-12">{viewingNote.title}</DialogTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditNote(viewingNote.id)}>
                      <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteNoteInitiate(viewingNote.id)}>
                      <Trash2 size={16} />
                  </Button>
                </div>
              </DialogHeader>
              <DialogDescription asChild>
                  <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                      <p className="text-foreground/90 whitespace-pre-wrap text-base">{viewingNote.content}</p>
                      <div className="flex flex-wrap gap-2">
                          {viewingNote.tags?.map(tag => (
                              <Badge key={tag} variant="secondary" className="font-normal bg-black/10 dark:bg-white/10 border-transparent">{tag}</Badge>
                          ))}
                      </div>
                  </div>
              </DialogDescription>
            </div>
            <div className="p-6 pt-2 text-right">
              <p className="text-xs text-foreground/60">
                  Criado em: {format(parseISO(viewingNote.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
            </div>
          </DialogContent>
        )}
      </Dialog>


      <AlertDialog open={projectToDelete !== null || noteToDelete !== null} onOpenChange={(open) => {
        if (!open) {
          setProjectToDelete(null);
          setNoteToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setProjectToDelete(null); setNoteToDelete(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
