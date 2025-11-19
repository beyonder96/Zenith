"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "../ui/progress";

type ShoppingItem = {
  id: number;
  text: string;
  completed: boolean;
};

export function ShoppingListCard() {
  const [items] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping-list", [
     {id: 1, text: "Exemplo", completed: false},
  ]);
  
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;

  return (
    <Card className="bg-zinc-900 border-zinc-800 rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
              Lista de Compras
            </CardTitle>
             <p className="text-sm text-muted-foreground pt-2">{totalItems} itens na lista</p>
        </div>
        <div className="p-2 bg-zinc-800 rounded-lg">
            <ShoppingCart className="text-white" size={20}/>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-white">{completedItems}/{totalItems} concluídos</p>
      </CardContent>
    </Card>
  );
}
