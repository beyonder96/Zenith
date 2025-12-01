'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function NewPetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSave = async () => {
    if (!name.trim() || !birthDate || !photoUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome, data de nascimento e foto são obrigatórios.",
      });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário não autenticado.' });
        return;
    }

    const petData = {
        name,
        breed,
        birthDate: format(birthDate, 'yyyy-MM-dd'),
        photoUrl,
        userId: user.uid,
    };
    
    addDoc(collection(firestore, 'pets'), petData).then(() => {
        toast({ title: "Pet adicionado!" });
        router.push('/projects');
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'pets',
            operation: 'create',
            requestResourceData: petData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">Novo Pet</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-2">
            <Label htmlFor="name">Nome do Pet</Label>
            <Input
                id="name"
                placeholder="Ex: Bob"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 h-12 text-lg"
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="photoUrl">URL da Foto</Label>
             <div className="flex items-center gap-2 p-2 rounded-lg bg-card dark:bg-zinc-800 border-border dark:border-zinc-700">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <Input
                    id="photoUrl"
                    placeholder="https://exemplo.com/foto.png"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="border-none bg-transparent h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            {photoUrl && (
                <div className="flex justify-center mt-4">
                    <img src={photoUrl} alt="Pré-visualização" className="rounded-full h-32 w-32 object-cover border-4 border-card" />
                </div>
            )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="breed">Raça (opcional)</Label>
                <Input
                id="breed"
                placeholder="Ex: Vira-lata"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                />
            </div>
            <div className="space-y-2">
                <Label>Nascimento</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md',
                        !birthDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'dd/MM/yyyy') : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        captionLayout="dropdown-buttons"
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

      </main>
    </div>
  );
}
