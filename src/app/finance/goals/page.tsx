'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalCard } from '@/components/finance/goals-card';
import { GoalTransactionDialog } from '@/components/finance/goal-transaction-dialog';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, runTransaction, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { Goal } from '@/components/finance/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'deposit' | 'withdraw';
    goal: Goal | null;
  }>({ isOpen: false, type: 'deposit', goal: null });

  useEffect(() => {
    if (!user || !firestore) {
        if (!user) setLoading(false);
        return;
    };
    
    setLoading(true);
    const goalsQuery = query(collection(firestore, "goals"), where("userId", "==", user.uid));

    const unsubscribeGoals = onSnapshot(goalsQuery, (querySnapshot) => {
        const userGoals: Goal[] = [];
        querySnapshot.forEach((doc) => {
            userGoals.push({ id: doc.id, ...doc.data() } as Goal);
        });
        setGoals(userGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
        setLoading(false);
      }, (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'goals',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });

    return () => {
        unsubscribeGoals();
    };

  }, [user, firestore]);

  const handleTransaction = async (goal: Goal, amount: number, type: 'deposit' | 'withdraw') => {
    if (!firestore || !user) return;
  
    const goalRef = doc(firestore, 'goals', goal.id);
    const newCurrentAmount = type === 'deposit' ? goal.currentAmount + amount : goal.currentAmount - amount;
  
    if (type === 'withdraw' && newCurrentAmount < 0) {
      toast({
        variant: 'destructive',
        title: 'Valor de resgate inválido',
        description: 'Você não pode resgatar mais do que o valor atual no cofrinho.',
      });
      return;
    }
  
    try {
      await runTransaction(firestore, async (transaction) => {
        // 1. Update the goal's current amount
        transaction.update(goalRef, { currentAmount: newCurrentAmount });
  
        // 2. Create a corresponding financial transaction
        const transactionData = {
          description: `${type === 'deposit' ? 'Depósito' : 'Resgate'} no cofrinho: ${goal.name}`,
          amount: type === 'deposit' ? -amount : amount, // Deposit is an expense, withdraw is income
          date: format(new Date(), 'yyyy-MM-dd'),
          type: type === 'deposit' ? 'expense' : 'income',
          category: 'Cofrinho',
          completed: true,
          userId: user.uid,
        };
        const transactionsCol = collection(firestore, 'transactions');
        transaction.set(doc(transactionsCol), transactionData);
      });
  
      toast({
        title: `Sucesso!`,
        description: `R$ ${amount.toFixed(2)} foram ${type === 'deposit' ? 'depositados' : 'resgatados'}.`,
      });
      setDialogState({ isOpen: false, type: 'deposit', goal: null });
    } catch (error: any) {
      console.error('Goal transaction failed: ', error);
      const permissionError = new FirestorePermissionError({
        path: `goals/${goal.id} or transactions`,
        operation: 'update',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);

  return (
    <>
      <div className="bg-background min-h-screen">
        <header className="p-4 sm:p-6 lg:p-8 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-light tracking-wider bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Meus Cofrinhos
          </h1>
          <Button asChild variant="ghost" size="icon">
            <Link href="/finance/goals/new">
                <Plus />
            </Link>
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-6 pb-28">
            <Card className="w-full max-w-lg bg-card/80 dark:bg-black/20 border-none">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Guardado</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-8 w-3/4" />
                    ) : (
                        <p className="text-3xl font-bold">
                            {totalSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    )}
                     <p className="text-xs text-muted-foreground">
                        Meta Total: {totalTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </CardContent>
            </Card>

            <div className="w-full max-w-lg space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-xl">
                        <p className="font-semibold">Nenhum cofrinho por aqui!</p>
                        <p className="text-sm">Clique no botão '+' para criar seu primeiro cofrinho.</p>
                    </div>
                ) : (
                    goals.map(goal => (
                        <GoalCard 
                            key={goal.id} 
                            goal={goal}
                            onDeposit={() => setDialogState({ isOpen: true, type: 'deposit', goal })}
                            onWithdraw={() => setDialogState({ isOpen: true, type: 'withdraw', goal })}
                            onEdit={() => router.push(`/finance/goals/new?id=${goal.id}`)}
                        />
                    ))
                )}
            </div>
        </main>
      </div>
      {dialogState.isOpen && dialogState.goal && (
        <GoalTransactionDialog
          goal={dialogState.goal}
          type={dialogState.type}
          onClose={() => setDialogState({ isOpen: false, type: 'deposit', goal: null })}
          onConfirm={handleTransaction}
        />
      )}
    </>
  );
}
