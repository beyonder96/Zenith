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
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping", []);
  
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className="bg-card border-none rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              Lista de Compras
            </CardTitle>
            {totalItems > 0 && <CardDescription>{totalItems} itens na lista</CardDescription>}
        </div>
        <ShoppingCart className="text-muted-foreground" size={20}/>
      </CardHeader>
      <CardContent>
        {totalItems > 0 ? (
            <div>
                <p className="text-2xl font-bold">{completedItems} / {totalItems} <span className="text-base font-normal text-muted-foreground">concluídos</span></p>
                <Progress value={progress} className="h-2 mt-2" />
            </div>
        ) : (
             <CardDescription>Nenhum item na lista.</CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
