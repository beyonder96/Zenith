'use client';

import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Loader2 } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
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

import type { Event } from '../types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';


interface EventsViewProps {
    events: Event[];
    loading: boolean;
    searchTerm: string;
}

export function EventsView({ events, loading, searchTerm }: EventsViewProps) {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [eventToDelete, setEventToDelete] = useState<string | null>(null);

    const handleDeleteEventInitiate = (id: string) => {
        setEventToDelete(id);
    };

    const handleDeleteConfirm = () => {
        if (eventToDelete !== null && firestore) {
            const docRef = doc(firestore, "events", eventToDelete);
            deleteDoc(docRef).then(() => {
                setEventToDelete(null);
                toast({ title: "Evento deletado", description: "O evento foi removido com sucesso." });
            }).catch(error => {
                if (error.code === 'permission-denied') {
                    const permissionError = new FirestorePermissionError({ path: `events/${eventToDelete}`, operation: 'delete' });
                    errorEmitter.emit('permission-error', permissionError);
                } else {
                     toast({
                        variant: "destructive",
                        title: "Erro ao deletar",
                        description: `Não foi possível deletar o evento. Detalhe: ${error.message}`
                    });
                }
                setEventToDelete(null);
            });
        }
    };
    
    const handleEditEvent = (id: string) => {
        router.push(`/events/new?id=${id}`);
    };

    return (
        <>
            <div className="w-full space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Nenhum evento encontrado.</p>
                        {searchTerm ? <p className="text-sm">Tente uma busca diferente.</p> : <p className="text-sm">Crie seu primeiro evento.</p>}
                    </div>
                ) : (
                    events.map(event => (
                        <EventCard 
                            key={event.id}
                            event={event}
                            onEdit={() => handleEditEvent(event.id)}
                            onDelete={() => handleDeleteEventInitiate(event.id)}
                        />
                    ))
                )}
            </div>

             <AlertDialog open={eventToDelete !== null} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso irá deletar permanentemente o evento.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>Deletar</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
