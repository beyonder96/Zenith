"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
};

export function FinanceCard() {
  const [entries, setEntries] = useLocalStorage<FinanceEntry[]>("zenith-vision-finance", []);
  
  const totalSpent = entries.reduce((acc, entry) => acc + (entry.amount < 0 ? entry.amount : 0), 0);

  return (
    <Card className="bg-black/20 border border-white/10 rounded-2xl backdrop-blur-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
              Finanças
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-white">R$ {totalSpent.toFixed(2)}</CardDescription>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          <BarChart3 className="text-white" size={20}/>
        </div>
      </CardHeader>
      <CardContent>
       <p className="text-xs text-muted-foreground">gastos hoje</p>
      </CardContent>
    </Card>
  );
}
