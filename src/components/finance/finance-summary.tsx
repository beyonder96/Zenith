'use client';

import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Hourglass, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';


type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  completed: boolean;
};

export function FinanceSummary() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useLocalStorage(
    'finance-balance-visible',
    false
  );
  const [includeSavingsInBalance] = useLocalStorage(
    'savings-in-balance-visible',
    false
  );


  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const q = query(collection(firestore, "transactions"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userTransactions: Transaction[] = [];
        snapshot.forEach(doc => {
            userTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });
        setTransactions(userTransactions);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'transactions',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribe();
    }
  }, [user, firestore]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const completedTransactions = transactions.filter(t => t.completed);
  const futureTransactions = transactions.filter(t => !t.completed && t.category !== 'Meta');

  const transactionsToCalculate = includeSavingsInBalance
    ? completedTransactions
    : completedTransactions.filter(t => t.category !== 'Meta');
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  const balance = transactionsToCalculate.reduce((acc, t) => acc + t.amount, 0);
  const futureBalance = futureTransactions.reduce((acc, t) => acc + t.amount, 0);
  const income = currentMonthTransactions.reduce((acc, t) => (t.type === 'income' && t.category !== 'Meta' ? acc + t.amount : acc), 0);
  const expenses = currentMonthTransactions.reduce((acc, t) => (t.type === 'expense' && t.category !== 'Meta' ? acc + t.amount : acc), 0);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const summaryData = [
    {
      title: 'Saldo Atual',
      amount: balance,
      icon: Wallet,
      color: 'text-foreground',
    },
    {
      title: 'Saldo Futuro',
      amount: futureBalance,
      icon: Hourglass,
      color: 'text-muted-foreground',
    },
    {
      title: 'Receitas do Mês',
      amount: income,
      icon: TrendingUp,
      color: 'text-cyan-500',
    },
    {
      title: 'Despesas do Mês',
      amount: Math.abs(expenses),
      icon: TrendingDown,
      color: 'text-pink-500',
    },
  ];

  if (!isClient) {
    return (
        <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className='flex justify-end'>
        <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            aria-label="Toggle balance visibility"
          >
            {isBalanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className='text-xs'>{isBalanceVisible ? 'Ocultar' : 'Mostrar'} valores</span>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {summaryData.map((item, index) => (
          <Card key={index} className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold transition-all duration-300", !isBalanceVisible && "blur-md select-none")}>
                {formatCurrency(item.amount)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
