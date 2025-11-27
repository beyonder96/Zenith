'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

type Transaction = {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    category: string;
};

export function SavingsList() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [includeSavings, setIncludeSavings] = useLocalStorage('savings-in-balance-visible', false);

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const savingsQuery = query(
            collection(firestore, "transactions"),
            where("userId", "==", user.uid),
            where("category", "==", "Meta")
        );

        const unsubscribe = onSnapshot(savingsQuery, (snapshot) => {
            const savingsTransactions: Transaction[] = [];
            snapshot.forEach(doc => {
                savingsTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
            });
            setTransactions(savingsTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching savings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    const totalSaved = transactions.reduce((acc, t) => {
        // Deposits are expenses (-) and Withdrawals are income (+)
        // To get the total saved, we need to invert the logic
        if (t.type === 'expense') return acc + Math.abs(t.amount); // Deposit
        if (t.type === 'income') return acc - Math.abs(t.amount); // Withdraw
        return acc;
    }, 0);
    
    return (
        <div className="w-full max-w-lg space-y-4">
            <Card className="w-full bg-card/80 dark:bg-black/20 border-none">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total na Poupança</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-8 w-3/4" />
                    ) : (
                        <p className="text-3xl font-bold text-cyan-400">
                            {totalSaved.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="w-full bg-card/80 dark:bg-black/20 border-none">
                 <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="include-savings" className="flex flex-col space-y-1">
                            <span>Incluir no saldo principal</span>
                            <span className="font-normal leading-snug text-muted-foreground text-xs">
                                Adiciona o valor da poupança ao seu saldo total em finanças.
                            </span>
                        </Label>
                        <Switch
                            id="include-savings"
                            checked={includeSavings}
                            onCheckedChange={setIncludeSavings}
                        />
                    </div>
                 </CardContent>
            </Card>

            <Card className="w-full bg-card/80 dark:bg-black/20 border-none">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-muted-foreground">Histórico da Poupança</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : transactions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            Nenhuma movimentação na poupança ainda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-background/50 dark:bg-zinc-800/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{t.description}</p>
                                        <p className="text-sm text-muted-foreground">{format(parseISO(t.date), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</p>
                                    </div>
                                    <p className={cn(
                                        "font-bold",
                                        t.type === 'expense' ? 'text-cyan-400' : 'text-pink-500'
                                    )}>
                                        {t.type === 'expense' ? '+' : '-'} {Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
