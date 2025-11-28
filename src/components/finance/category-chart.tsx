'use client';

import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from 'next-themes';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { subDays, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

type Transaction = {
  id: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
};

const COLORS = [
  '#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#e879f9'
];

export function CategoryChart() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    if(user && firestore) {
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

  const categoryData = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    const expensesByCat = transactions
      .filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), { start, end }))
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);
  
  const tooltipBg = resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)';
  const tooltipBorder = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const axisColor = resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280';


  return (
    <Card className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">Despesas do Mês por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {!isClient ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '0.75rem',
                    backdropFilter: 'blur(4px)',
                }}
                labelStyle={{ color: axisColor }}
                formatter={(value: number) => [
                  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                  'Total'
                ]}
              />
               <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
             <div className="text-center text-muted-foreground">
                <p>Nenhuma despesa registrada este mês.</p>
             </div>
        )}
      </CardContent>
    </Card>
  );
}
