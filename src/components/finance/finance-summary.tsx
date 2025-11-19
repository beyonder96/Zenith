"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function FinanceSummary() {
  const summaryData = [
    {
      title: "Saldo Atual",
      amount: "R$ 7.843,21",
      icon: Wallet,
      color: "text-white",
    },
    {
      title: "Receitas do Mês",
      amount: "R$ 2.500,00",
      icon: TrendingUp,
      color: "text-cyan-300",
    },
    {
      title: "Despesas do Mês",
      amount: "R$ 1.234,56",
      icon: TrendingDown,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryData.map((item, index) => (
        <Card key={index} className="bg-black/20 border-white/10 backdrop-blur-md text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.amount}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
