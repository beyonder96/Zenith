"use client";

import { useFirestore, useUser } from "@/firebase";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import Link from "next/link";

type FinanceEntry = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

export function FinanceCard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(firestore, "transactions"), 
        where("userId", "==", user.uid),
        where("date", "==", today)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const dailyEntries: FinanceEntry[] = [];
        snapshot.forEach(doc => {
          dailyEntries.push({ id: doc.id, ...doc.data() } as FinanceEntry);
        });
        setEntries(dailyEntries);
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
  
  const hasActivity = entries.length > 0;
  const totalSpent = entries.reduce((acc, entry) => acc + (entry.amount < 0 ? entry.amount : 0), 0);

  return (
    <Link href="/finance" className="block transition-transform hover:scale-[1.02]">
        <Card className="bg-card text-card-foreground rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col">
                <CardTitle className="text-base font-semibold text-card-foreground/90">
                Finanças do Dia
                </CardTitle>
            </div>
            <BarChart3 className="text-muted-foreground" size={20}/>
        </CardHeader>
        <CardContent>
            {!isClient ? (
                <div className="space-y-2">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            ) : hasActivity ? (
                <>
                    <p className="text-2xl font-bold">R$ {Math.abs(totalSpent).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">gastos hoje</p>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
            )}
        </CardContent>
        </Card>
    </Link>
  );
}
