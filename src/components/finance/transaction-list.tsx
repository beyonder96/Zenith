"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Gift,
  Heart,
  Home,
  Utensils,
  MoreHorizontal,
} from "lucide-react";

const transactions = [
  {
    category: "Salário",
    icon: Briefcase,
    description: "Salário de Maio",
    date: "05/05/2024",
    amount: 2500,
    type: "income",
  },
  {
    category: "Contas",
    icon: Home,
    description: "Aluguel",
    date: "10/05/2024",
    amount: -800,
    type: "expense",
  },
  {
    category: "Alimentação",
    icon: Utensils,
    description: "Supermercado",
    date: "12/05/2024",
    amount: -150.75,
    type: "expense",
  },
  {
    category: "Saúde",
    icon: Heart,
    description: "Farmácia",
    date: "15/05/2024",
    amount: -45.5,
    type: "expense",
  },
   {
    category: "Lazer",
    icon: Gift,
    description: "Presente de Aniversário",
    date: "20/05/2024",
    amount: -100,
    type: "expense",
  },
];

const categoryIcons: { [key: string]: React.ElementType } = {
  Salário: Briefcase,
  Contas: Home,
  Alimentação: Utensils,
  Saúde: Heart,
  Lazer: Gift,
};

export function TransactionList() {
  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-md text-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-muted-foreground">
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const Icon = categoryIcons[transaction.category] || MoreHorizontal;
            return (
              <div
                key={index}
                className="flex items-center"
              >
                <div className="p-3 bg-white/10 rounded-lg mr-4">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date}
                  </p>
                </div>
                <div
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-cyan-300"
                      : "text-pink-400"
                  }`}
                >
                  {transaction.amount < 0 ? "-" : "+"}R$ {Math.abs(transaction.amount).toFixed(2).replace(".", ",")}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
