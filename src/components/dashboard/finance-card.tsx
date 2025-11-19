"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
};

export function FinanceCard() {
  const [entries] = useLocalStorage<FinanceEntry[]>("zenith-vision-finance", []);
  
  const hasActivity = entries.length > 0;
  const totalSpent = entries.reduce((acc, entry) => acc + (entry.amount < 0 ? entry.amount : 0), 0);

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex flex-col">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
              Finanças do Dia
            </CardTitle>
        </div>
        <div className="p-2 bg-zinc-800 rounded-lg">
          <BarChart3 className="text-white" size={20}/>
        </div>
      </CardHeader>
      <CardContent>
        {hasActivity ? (
            <>
                <p className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">gastos hoje</p>
            </>
        ) : (
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
