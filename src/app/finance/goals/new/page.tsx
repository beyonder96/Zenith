'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, getDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Goal } from '@/components/finance/types';

export default function NewGoalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [goalId, setGoalId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [currentAmount, setCurrentAmount] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isEditing = goalId !== null;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && user && firestore) {
      const fetchGoal = async () => {
        const docRef = doc(firestore, 'goals', id);
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const goalToEdit = {id: docSnap.id, ...docSnap.data()} as Goal;
                setGoalId(goalToEdit.id);
                setName(goalToEdit.name);
                setTargetAmount(String(goalToEdit.targetAmount));
                setCurrentAmount(goalToEdit.currentAmount);
                if (goalToEdit.deadline) {
                    setDeadline(parseISO(goalToEdit.deadline));
                }
            }
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: `goals/${id}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
      };
      fetchGoal();
    }
  }, [searchParams, user, firestore]);

  const handleSave = async () => {
    if (!name.trim() || !targetAmount.trim() || !deadline) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome, valor alvo e prazo são necessários.",
      });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário não autenticado.' });
        return;
    }

    const numericAmount = parseFloat(targetAmount.replace('.', '').replace(',', '.'));
     if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Valor alvo inválido",
        description: "Por favor, insira um número positivo para o valor alvo.",
      });
      return;
    }

    const goalData = {
        name,
        targetAmount: numericAmount,
        deadline: format(deadline, 'yyyy-MM-dd'),
        userId: user.uid,
    };
    
    let promise;
    if (isEditing && goalId) {
        promise = setDoc(doc(firestore, 'goals', goalId), goalData, { merge: true });
    } else {
        promise = addDoc(collection(firestore, 'goals'), { ...goalData, currentAmount: 0 });
    }

    promise.then(() => {
        if (isEditing) {
            toast({ title: "Cofrinho atualizado!" });
            router.push('/finance/goals');
        } else {
            setShowSuccessAnimation(true);
            setTimeout(() => {
                router.push('/finance/goals');
            }, 1500);
            setTimeout(() => {
              setShowSuccessAnimation(false)
            }, 2000);
        }
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: isEditing && goalId ? `goals/${goalId}` : 'goals',
            operation: isEditing ? 'update' : 'create',
            requestResourceData: goalData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDelete = async () => {
    if (!goalId || !firestore) return;

    if (currentAmount > 0) {
        toast({
            variant: "destructive",
            title: "Não é possível excluir",
            description: "Resgate o valor do cofrinho antes de excluí-lo.",
        });
        setIsDeleteDialogOpen(false);
        return;
    }

    deleteDoc(doc(firestore, 'goals', goalId)).then(() => {
        toast({
            title: "Cofrinho excluído!",
        });
        router.push('/finance/goals');
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `goals/${goalId}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };


  if (showSuccessAnimation) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center animate-fade-in">
        <div className="success-checkmark__container">
          <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">{isEditing ? 'Editar Cofrinho' : 'Novo Cofrinho'}</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-2">
            <Label htmlFor="name">Nome do Cofrinho</Label>
            <Input
                id="name"
                placeholder="Ex: Viagem de Férias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 h-12 text-lg"
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
                <Input
                id="targetAmount"
                type="text"
                inputMode="decimal"
                placeholder="1.000,00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                />
            </div>
            <div className="space-y-2">
                <Label>Prazo Final</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md',
                        !deadline && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, 'dd/MM/yyyy') : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        {isEditing && (
             <Button variant="destructive" className="w-full" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir Cofrinho
            </Button>
        )}
      </main>
    </div>
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso irá deletar permanentemente este cofrinho.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
