'use client';

import { Area, AreaChart, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from 'next-themes';
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
};

export function FinanceChart() {
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

  const processChartData = () => {
    const sixMonthsAgo = subMonths(new Date(), 5);
    sixMonthsAgo.setDate(1);

    const data = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM', { locale: ptBR }),
        year: date.getFullYear(),
        revenue: 0,
        expenses: 0,
      };
    });

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= sixMonthsAgo) {
        const month = format(transactionDate, 'MMM', { locale: ptBR });
        const dataPoint = data.find(d => d.month === month && d.year === transactionDate.getFullYear());
        if (dataPoint) {
          if (transaction.type === 'income') {
            dataPoint.revenue += transaction.amount;
          } else {
            dataPoint.expenses += Math.abs(transaction.amount);
          }
        }
      }
    });

    return data;
  };

  const chartData = isClient ? processChartData() : [];
  const axisColor = resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280';
  const tooltipBg = resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)';
  const tooltipBorder = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';

  return (
    <Card className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">Visão Geral Mensal</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pl-2">
        {!isClient ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `R$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '0.75rem',
                  backdropFilter: 'blur(4px)',
                }}
                labelStyle={{ color: axisColor }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                  name === 'revenue' ? 'Receitas' : 'Despesas',
                ]}
              />
              <Area type="monotone" dataKey="revenue" name="Receitas" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Despesas" stroke="#f472b6" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
