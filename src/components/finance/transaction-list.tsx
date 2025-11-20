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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SwipeableListItem } from './swipeable-list-item';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  const router = useRouter();
  const { toast } = useToast();
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('zenith-vision-finance', []);
  const [isClient, setIsClient] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (id: number) => {
    router.push(`/finance/new?id=${id}`);
  };

  const handleDeleteInitiate = (id: number) => {
    setTransactionToDelete(id);
  };
  
  const handleDeleteConfirm = () => {
    if (transactionToDelete !== null) {
      setTransactions(transactions.filter(t => t.id !== transactionToDelete));
      setTransactionToDelete(null);
      toast({
        title: "Transação deletada",
        description: "A transação foi removida com sucesso.",
      });
    }
  };

  return (
    <>
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
            <div className="space-y-2">
              {sortedTransactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category] || MoreHorizontal;
                const formattedDate = format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR });
                return (
                  <SwipeableListItem
                    key={transaction.id}
                    onSwipeLeft={() => handleDeleteInitiate(transaction.id)}
                    onSwipeRight={() => handleEdit(transaction.id)}
                  >
                    <div className="flex items-center w-full p-2 rounded-lg">
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
                  </SwipeableListItem>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={transactionToDelete !== null} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a transação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
