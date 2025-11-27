'use client';

import { useFirestore, useUser } from '@/firebase';
import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import Link from 'next/link';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type FinanceEntry = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  completed: boolean;
};

export function FinanceCard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useLocalStorage(
    'finance-balance-visible',
    true
  );
  const [includeSavingsInBalance] = useLocalStorage(
    'savings-in-balance-visible',
    false
  );

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const q = query(
        collection(firestore, 'transactions'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const allEntries: FinanceEntry[] = [];
          snapshot.forEach((doc) => {
            allEntries.push({ id: doc.id, ...doc.data() } as FinanceEntry);
          });
          setEntries(allEntries);
        },
        (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: `transactions`,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );
      return () => unsubscribe();
    }
  }, [user, firestore]);
  
  const completedTransactions = entries.filter(e => e.completed);

  const transactionsToCalculate = includeSavingsInBalance
    ? completedTransactions
    : completedTransactions.filter(t => t.category !== 'Meta');

  const totalBalance = transactionsToCalculate.reduce((acc, entry) => acc + entry.amount, 0);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede a navegação do Link
    e.stopPropagation(); // Impede a propagação do evento
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <Link href="/finance" className="block transition-transform hover:scale-[1.02]">
      <Card className="bg-card text-card-foreground rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground/90">
            Saldo Atual
          </CardTitle>
          <BarChart3 className="text-muted-foreground" size={20} />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {!isClient ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : completedTransactions.length > 0 ? (
            <div>
              <p
                className={cn(
                  'text-2xl font-bold transition-all duration-300',
                  totalBalance >= 0 ? 'text-cyan-500' : 'text-pink-500',
                  !isBalanceVisible && 'blur-md select-none'
                )}
              >
                R$ {totalBalance.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-muted-foreground">Balanço total</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
          )}
           <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleToggleVisibility}
              aria-label="Toggle balance visibility"
            >
              {isBalanceVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
