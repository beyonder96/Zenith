'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Briefcase,
  Gift,
  Heart,
  Home,
  Utensils,
  MoreHorizontal,
  ShoppingBag,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
};

const categoryIcons: { [key: string]: React.ElementType } = {
  Salário: Briefcase,
  Contas: Home,
  Alimentação: Utensils,
  Saúde: Heart,
  Lazer: Gift,
  Compras: ShoppingBag,
  Freelance: Briefcase,
  Investimentos: Briefcase,
  Outros: MoreHorizontal,
};

export function TransactionList() {
  const [transactions] = useLocalStorage<Transaction[]>('zenith-vision-finance', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isClient ? (
             <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-lg mr-4" />
                        <div className="flex-grow space-y-2">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-1/4" />
                        </div>
                        <Skeleton className="h-6 w-1/5" />
                    </div>
                ))}
             </div>
        ) : sortedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação registrada ainda.</p>
                <p className="text-sm">Clique no botão "+" para adicionar uma.</p>
            </div>
        ) : (
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => {
              const Icon = categoryIcons[transaction.category] || MoreHorizontal;
              const formattedDate = format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR });
              return (
                <div
                  key={transaction.id}
                  className="flex items-center"
                >
                  <div className="p-3 bg-muted dark:bg-white/10 rounded-lg mr-4">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                    </p>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-cyan-500"
                        : "text-pink-500"
                    }`}
                  >
                    {transaction.type === 'expense' ? "-" : "+"}R$ {Math.abs(transaction.amount).toFixed(2).replace(".", ",")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
