"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
};

export function FinanceCard() {
  const [entries, setEntries] = useLocalStorage<FinanceEntry[]>("zenith-vision-finance", []);
  
  const hasEntries = entries.length > 0;

  return (
    <Card className="bg-card border-none rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Finanças do Dia
            </CardTitle>
            {!hasEntries && (
                 <CardDescription>Nenhuma atividade registrada.</CardDescription>
            )}
        </div>
        <BarChart3 className="text-muted-foreground" size={20}/>
      </CardHeader>
      <CardContent>
       {/* Future content for finance entries can go here. */}
      </CardContent>
    </Card>
  );
}
