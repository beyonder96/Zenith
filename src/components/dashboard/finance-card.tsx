"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
};

export function FinanceCard() {
  const [entries] = useLocalStorage<FinanceEntry[]>("zenith-vision-finance", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const hasActivity = entries.length > 0;
  const totalSpent = entries.reduce((acc, entry) => acc + (entry.amount < 0 ? entry.amount : 0), 0);

  return (
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
                <p className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">gastos hoje</p>
            </>
        ) : (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
