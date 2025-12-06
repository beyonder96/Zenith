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
  Check,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { format, parseISO, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
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
import { collection, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useCollection } from '@/firebase/firestore/use-collection';


type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  completed: boolean;
};

type GroupedTransactions = {
  [date: string]: Transaction[];
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
  const firestore = useFirestore();
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const transactionsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, "transactions"), where("userId", "==", user.uid));
  }, [user, firestore]);

  const { data: transactions, loading, hasMore, loadMore } = useCollection<Transaction>(transactionsQuery, {
      limit: 10,
      orderBy: ['date', 'desc']
  });

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.reduce((acc: GroupedTransactions, transaction) => {
      const date = transaction.date.split('T')[0]; // Group by day
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});
  }, [transactions]);
  
  const sortedDates = useMemo(() => Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [groupedTransactions]);

  const handleEdit = (id: string) => {
    router.push(`/finance/new?id=${id}`);
  };

  const handleDeleteInitiate = (id: string) => {
    setTransactionToDelete(id);
  };
  
  const handleMarkAsCompleted = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "transactions", id);
    const updateData = { completed: true };
    updateDoc(docRef, updateData)
      .then(() => {
        toast({ title: "Transação efetuada!" });
      })
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `transactions/${id}`,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete !== null && firestore) {
      const docRef = doc(firestore, "transactions", transactionToDelete);
      deleteDoc(docRef).then(() => {
        setTransactionToDelete(null);
        toast({
          title: "Transação deletada",
          description: "A transação foi removida com sucesso.",
        });
      }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `transactions/${transactionToDelete}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        setTransactionToDelete(null);
      });
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  const renderTransactionItem = (transaction: Transaction) => {
      const Icon = categoryIcons[transaction.category] || MoreHorizontal;
      return (
        <SwipeableListItem
            key={transaction.id}
            onSwipeLeft={() => handleDeleteInitiate(transaction.id)}
            onSwipeRight={() => handleEdit(transaction.id)}
        >
            <div className={cn("flex items-center w-full p-2 rounded-lg", !transaction.completed && "opacity-60")}>
                <div className="p-3 bg-muted dark:bg-white/10 rounded-lg mr-4">
                <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-grow min-w-0">
                <p className="font-semibold truncate">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                    {transaction.category}
                </p>
                </div>
                <div className="flex items-center flex-shrink-0 ml-4">
                    <div
                    className={cn('font-semibold text-right text-nowrap',
                        transaction.type === "income"
                        ? "text-cyan-500"
                        : "text-pink-500"
                    )}
                    >
                    {transaction.type === 'expense' ? "-" : "+"}R$ {Math.abs(transaction.amount).toFixed(2).replace(".", ",")}
                    </div>
                    <div className="w-8 flex justify-center">
                    {!transaction.completed ? (
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleMarkAsCompleted(transaction.id)}>
                        <Check className="h-5 w-5 text-green-500" />
                    </Button>
                    ) : (
                    <div className='h-8 w-8 flex items-center justify-center'>
                        <Check className='h-5 w-5 text-green-500 opacity-50'/>
                    </div>
                    )}
                    </div>
                </div>
            </div>
        </SwipeableListItem>
      )
  };

  return (
    <>
      <Card className="bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-md text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-muted-foreground">
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isClient || (loading && transactions.length === 0) ? (
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
          ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma transação registrada ainda.</p>
                  <p className="text-sm">Clique no botão "+" para adicionar uma.</p>
              </div>
          ) : (
            <div className="space-y-4">
              {sortedDates.map(date => {
                 const dailyTransactions = groupedTransactions[date];
                 const dailyIncome = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                 const dailyExpenses = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                return (
                  <div key={date}>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="font-semibold text-foreground capitalize">{formatDateHeader(date)}</h3>
                        <div className='flex gap-3 text-xs'>
                            {dailyIncome > 0 && <span className='flex items-center gap-1 text-cyan-500'><ArrowUpCircle size={14}/> {dailyIncome.toFixed(2).replace('.', ',')}</span>}
                            {dailyExpenses < 0 && <span className='flex items-center gap-1 text-pink-500'><ArrowDownCircle size={14}/> {Math.abs(dailyExpenses).toFixed(2).replace('.', ',')}</span>}
                        </div>
                    </div>
                    <div className="space-y-2">
                      {dailyTransactions.map(renderTransactionItem)}
                    </div>
                  </div>
                )
              })}
              {hasMore && (
                <Button onClick={loadMore} disabled={loading} className="w-full mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : 'Carregar mais'}
                </Button>
              )}
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
