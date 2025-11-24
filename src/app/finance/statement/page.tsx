'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Printer, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirebaseClientProvider } from '@/firebase/client-provider';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
};

function StatementContent() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startDateParam = searchParams.get('start');
  const endDateParam = searchParams.get('end');
  const statementType = searchParams.get('type') as 'detailed' | 'summary';

  useEffect(() => {
    // Wait until Firebase auth state is determined
    if (userLoading) {
      return;
    }

    if (!startDateParam || !endDateParam) {
        setError("Período inválido. Por favor, gere o extrato novamente.");
        setLoading(false);
        return;
    }

    // If auth is loaded and there's still no user, then show error
    if (!user) {
      setError("Você precisa estar logado para ver o extrato.");
      setLoading(false);
      return;
    }
    
    if (!firestore) {
      setError("Não foi possível conectar ao banco de dados.");
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      setError(null);
      setLoading(true);
      try {
        const q = query(
          collection(firestore, 'transactions'),
          where('userId', '==', user.uid),
          where('date', '>=', startDateParam),
          where('date', '<=', endDateParam) 
        );

        const querySnapshot = await getDocs(q);
        const fetchedTransactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        setTransactions(fetchedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      } catch (err: any) {
        console.error(err);
         if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: 'transactions',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setError("Você não tem permissão para acessar estas transações.");
        } else {
            setError("Ocorreu um erro ao buscar as transações.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, userLoading, firestore, startDateParam, endDateParam]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Gerando seu extrato...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h2 className="text-xl font-semibold text-destructive">{error}</h2>
            <Button onClick={() => window.close()} className="mt-4">Fechar</Button>
        </div>
    );
  }

  if (!startDateParam || !endDateParam) {
    return null; // Should be handled by error state, but as a safeguard.
  }

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income + expenses;
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const summaryCards = [
    { title: 'Total Receitas', value: formatCurrency(income), icon: ArrowUpCircle, color: 'text-cyan-500' },
    { title: 'Total Despesas', value: formatCurrency(Math.abs(expenses)), icon: ArrowDownCircle, color: 'text-pink-500' },
    { title: 'Saldo do Período', value: formatCurrency(balance), icon: Scale, color: balance >= 0 ? 'text-cyan-500' : 'text-pink-500' },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8 print:p-0">
        <header className="mb-8 print:hidden">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold">Extrato Financeiro</h1>
                    <p className="text-muted-foreground">
                        Período de {format(parseISO(startDateParam), 'dd/MM/yy')} a {format(parseISO(endDateParam), 'dd/MM/yy')}
                    </p>
                </div>
                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir ou Salvar PDF</Button>
            </div>
        </header>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-bold">Extrato Financeiro</h1>
            <p className="text-muted-foreground">
                Período: {format(parseISO(startDateParam), 'dd/MM/yyyy', {locale: ptBR})} a {format(parseISO(endDateParam), 'dd/MM/yyyy', {locale: ptBR})}
            </p>
            <p className="text-sm text-muted-foreground">Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>

        <main className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {summaryCards.map(card => (
                    <Card key={card.title} className="bg-card dark:bg-zinc-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {statementType === 'detailed' && (
              <Card className="bg-card dark:bg-zinc-800/50">
                <CardHeader>
                    <CardTitle>Transações Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.length > 0 ? transactions.map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-background dark:bg-zinc-800">
                        <div>
                          <p className="font-semibold">{t.description}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(t.date), "dd 'de' MMM, yyyy", { locale: ptBR })} - {t.category}</p>
                        </div>
                        <p className={`font-semibold ${t.type === 'income' ? 'text-cyan-500' : 'text-pink-500'}`}>{formatCurrency(t.amount)}</p>
                      </div>
                    )) : (
                      <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada no período selecionado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
             {statementType === 'summary' && (
              <Card className="bg-card dark:bg-zinc-800/50">
                <CardHeader>
                    <CardTitle>Transações Resumidas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                     {Object.entries(transactions.reduce((acc, t) => {
                        if (!acc[t.category]) acc[t.category] = 0;
                        acc[t.category] += t.amount;
                        return acc;
                      }, {} as Record<string, number>)).map(([category, total]) => (
                      <div key={category} className="flex justify-between items-center p-3 rounded-lg border border-border bg-background dark:bg-zinc-800">
                        <p className="font-semibold">{category}</p>
                        <p className={`font-semibold ${total >= 0 ? 'text-cyan-500' : 'text-pink-500'}`}>{formatCurrency(total)}</p>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada no período selecionado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

        </main>
    </div>
  );
}

export default function StatementPage() {
    return (
        <FirebaseClientProvider>
            <Suspense fallback={<div>Carregando...</div>}>
                <StatementContent />
            </Suspense>
        </FirebaseClientProvider>
    )
}
