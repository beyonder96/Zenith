'use client';

import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/notes/note-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Note } from '../types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

interface NotesViewProps {
    notes: Note[];
    loading: boolean;
    searchTerm: string;
}

export function NotesView({ notes, loading, searchTerm }: NotesViewProps) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const [viewingNote, setViewingNote] = useState<Note | null>(null);

    const handleDeleteNoteInitiate = (id: string) => {
        setViewingNote(null); 
        setTimeout(() => setNoteToDelete(id), 150);
    };

    const handleDeleteConfirm = () => {
        if (noteToDelete !== null && firestore) {
            const docRef = doc(firestore, "notes", noteToDelete);
            deleteDoc(docRef).then(() => {
                setNoteToDelete(null);
                toast({ title: "Nota deletada", description: "A nota foi removida com sucesso." });
            }).catch(error => {
                if (error.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({ path: `notes/${noteToDelete}`, operation: 'delete' });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                     toast({
                        variant: "destructive",
                        title: "Erro ao deletar",
                        description: `Não foi possível deletar a nota. Detalhe: ${error.message}`
                    });
                }
                setNoteToDelete(null);
            });
        }
    };
    
    const handleEditNote = (id: string) => {
        setViewingNote(null);
        router.push(`/notes/new?id=${id}`);
    };

    return (
        <>
            <div className="w-full space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Nenhuma nota encontrada.</p>
                        {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie sua primeira nota.</p>}
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

            <AlertDialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso irá deletar permanentemente a nota.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Deletar</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
