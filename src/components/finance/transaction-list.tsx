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
} from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
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
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  completed: boolean;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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
            path: `transactions`,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
        return () => unsubscribe();
    }
  }, [user, firestore]);
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
                    <div className={cn("flex items-center w-full p-2 rounded-lg", !transaction.completed && "opacity-60")}>
                      <div className="p-3 bg-muted dark:bg-white/10 rounded-lg mr-4">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {formattedDate}
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
