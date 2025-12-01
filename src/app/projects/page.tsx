

'use client';

import { useState, useEffect, useMemo } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProjectCard, Project, Subtask } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, StickyNote, ListTodo, Edit, Trash2, X, CalendarDays, Search, Home } from "lucide-react";
import Link from "next/link";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
import type { Event } from '@/components/events/events';
import { EventCard } from '@/components/events/event-card';
import { Input } from '@/components/ui/input';

export default function ProjectsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showDeleteCompletedDialog, setShowDeleteCompletedDialog] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState<'projects' | 'notes' | 'events' | 'casa'>('projects');
  const [searchTerm, setSearchTerm] = useState('');

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
          const data = doc.data();
          userNotes.push({ 
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
            } as Note);
        });
        setNotes(userNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({ path: 'notes', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      // Events listener
      const eventsQuery = query(collection(firestore, "events"), where("userId", "==", user.uid));
      const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
        const userEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          userEvents.push({ id: doc.id, ...doc.data() } as Event);
        });
        setEvents(userEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({ path: 'events', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
      });

      return () => {
        unsubscribeProjects();
        unsubscribeNotes();
        unsubscribeEvents();
      };
    }
  }, [user, firestore]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subtasks?.some(s => s.text.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [projects, searchTerm]);
  
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    return notes.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [notes, searchTerm]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    return events.filter(e =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

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
  
  const handleDeleteEventInitiate = (id: string) => {
    setEventToDelete(id);
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
    if (eventToDelete !== null && firestore) {
        const docRef = doc(firestore, "events", eventToDelete);
        deleteDoc(docRef).then(() => {
            setEventToDelete(null);
            toast({ title: "Evento deletado", description: "O evento foi removido com sucesso." });
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: `events/${eventToDelete}`, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            setEventToDelete(null);
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

  const handleEditNote = (id: string) => {
    setViewingNote(null);
    router.push(`/notes/new?id=${id}`);
  };

  const handleEditEvent = (id: string) => {
    router.push(`/events/new?id=${id}`);
  }
  
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
  
  const hasCompletedProjects = projects.some(p => p.completed);

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
                 <div className="relative w-full max-w-md mb-4">
                    <Input
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-card/50 dark:bg-black/20 border-none rounded-full h-11 backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 </div>

                 <div className="flex w-full items-center justify-center gap-2 mb-4">
                  <Button
                    onClick={() => setActiveView('projects')}
                    variant={activeView === 'projects' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-4 transition-all',
                      activeView === 'projects' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Tarefas
                  </Button>
                  <Button
                    onClick={() => setActiveView('notes')}
                    variant={activeView === 'notes' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-4 transition-all',
                      activeView === 'notes' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Notas
                  </Button>
                  <Button
                    onClick={() => setActiveView('events')}
                    variant={activeView === 'events' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-4 transition-all',
                      activeView === 'events' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Eventos
                  </Button>
                   <Button
                    onClick={() => setActiveView('casa')}
                    variant={activeView === 'casa' ? 'default' : 'ghost'}
                    className={cn(
                      'rounded-full px-4 transition-all',
                      activeView === 'casa' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                  >
                    Casa
                  </Button>
                </div>
                
                 {activeView === 'projects' && hasCompletedProjects && (
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

                {activeView === 'projects' && (
                  <div className="w-full space-y-4">
                      {!isClient ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                          <p>Nenhuma tarefa encontrada.</p>
                          {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie sua primeira tarefa.</p>}
                        </div>
                      ) : (
                        filteredProjects.map(project => (
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
                        ) : filteredNotes.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                              <p>Nenhuma nota encontrada.</p>
                              {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie sua primeira nota.</p>}
                            </div>
                        ) : (
                           <div className="columns-2 gap-4">
                             {filteredNotes.map(note => (
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
                {activeView === 'events' && (
                  <div className="w-full space-y-4">
                      {!isClient ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                           <p>Nenhum evento encontrado.</p>
                          {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie seu primeiro evento.</p>}
                        </div>
                      ) : (
                        filteredEvents.map(event => (
                          <EventCard 
                            key={event.id}
                            event={event}
                            onEdit={() => handleEditEvent(event.id)}
                            onDelete={() => handleDeleteEventInitiate(event.id)}
                          />
                        ))
                      )}
                  </div>
                )}
                {activeView === 'casa' && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Seção em construção.</p>
                    </div>
                )}
              </div>
          </main>
          
          <div className="fixed z-20 bottom-28 right-6 flex items-center gap-2">
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/tasks/new">
                    <ListTodo className="mr-2 h-4 w-4" /> Tarefa
                </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/notes/new">
                    <StickyNote className="mr-2 h-4 w-4" /> Nota
                </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/events/new">
                    <CalendarDays className="mr-2 h-4 w-4" /> Evento
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


      <AlertDialog open={projectToDelete !== null || noteToDelete !== null || eventToDelete !== null} onOpenChange={(open) => {
        if (!open) {
          setProjectToDelete(null);
          setNoteToDelete(null);
          setEventToDelete(null);
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
            <AlertDialogCancel onClick={() => { setProjectToDelete(null); setNoteToDelete(null); setEventToDelete(null); }}>Cancelar</AlertDialogCancel>
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
  );
}
