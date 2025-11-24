'use client';

import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Hourglass } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

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
  const futureTransactions = transactions.filter(t => !t.completed);

  const currentMonthTransactions = completedTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  const balance = completedTransactions.reduce((acc, t) => acc + t.amount, 0);
  const futureBalance = futureTransactions.reduce((acc, t) => acc + t.amount, 0);
  const income = currentMonthTransactions.reduce((acc, t) => (t.type === 'income' ? acc + t.amount : acc), 0);
  const expenses = currentMonthTransactions.reduce((acc, t) => (t.type === 'expense' ? acc + t.amount : acc), 0);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const summaryData = [
    {
      title: 'Saldo Atual',
      amount: formatCurrency(balance),
      icon: Wallet,
      color: 'text-foreground',
    },
    {
      title: 'Saldo Futuro',
      amount: formatCurrency(futureBalance),
      icon: Hourglass,
      color: 'text-muted-foreground',
    },
    {
      title: 'Receitas do Mês',
      amount: formatCurrency(income),
      icon: TrendingUp,
      color: 'text-cyan-500',
    },
    {
      title: 'Despesas do Mês',
      amount: formatCurrency(Math.abs(expenses)),
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
    <div className="grid grid-cols-2 gap-4">
      {summaryData.map((item, index) => (
        <Card key={index} className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.amount}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
