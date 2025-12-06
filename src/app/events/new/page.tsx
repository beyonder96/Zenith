'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Event } from '@/app/projects/types';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Textarea } from '@/components/ui/textarea';

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [eventId, setEventId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const isEditing = eventId !== null;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && firestore) {
      const fetchEvent = async () => {
        const docRef = doc(firestore, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const eventToEdit = {id: docSnap.id, ...docSnap.data()} as Event;
            setEventId(eventToEdit.id);
            setTitle(eventToEdit.title);
            setDescription(eventToEdit.description || '');
            setLocation(eventToEdit.location || '');
            setTime(eventToEdit.time || '');
            if (eventToEdit.date) {
                setDate(parseISO(eventToEdit.date));
            }
        }
      };
      fetchEvent();
    }
  }, [searchParams, firestore]);

  const handleSave = async () => {
    if (!title.trim() || !date) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Título e data são obrigatórios.",
      });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário ou banco de dados não disponível' });
        return;
    }

    const eventData = {
        title,
        date: format(date, 'yyyy-MM-dd'),
        time,
        location,
        description,
        userId: user.uid,
    };
    
    try {
      if (isEditing && eventId) {
        await setDoc(doc(firestore, 'events', eventId), eventData, { merge: true });
      } else {
        await addDoc(collection(firestore, 'events'), eventData);
      }
      toast({
          title: isEditing ? "Evento atualizado!" : "Evento criado!",
      });
      router.push('/projects');
    } catch (error: any) {
        console.error("Save error:", error);
        const operation = isEditing ? 'update' : 'create';
        const path = isEditing && eventId ? `events/${eventId}` : 'events';

        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path,
                operation,
                requestResourceData: eventData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro ao Salvar',
                description: `Não foi possível salvar o evento. Detalhe: ${error.message}`
            });
        }
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="link" onClick={() => router.back()} className="text-orange-500">
          Voltar
        </Button>
        <h1 className="font-bold text-lg">{isEditing ? 'Editar Evento' : 'Evento'}</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-2">
          <Input
            id="title"
            placeholder="Nome do Evento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card dark:bg-zinc-800 border-none rounded-md h-12 text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md',
                        !date && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy') : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="time">Horário (opcional)</Label>
                <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="location">Local (opcional)</Label>
            <Input
                id="location"
                placeholder="Ex: Online ou endereço"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
            />
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea 
                id="description"
                placeholder="Adicione mais detalhes sobre o evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
            />
        </div>

      </main>
    </div>
  );
}
