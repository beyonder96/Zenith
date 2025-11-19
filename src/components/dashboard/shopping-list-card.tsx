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
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping-v2", [
    {id: 1, text: "Maçãs", completed: true},
    {id: 2, text: "Leite", completed: true},
    {id: 3, text: "Pão", completed: false},
    {id: 4, text: "Ovos", completed: false},
    {id: 5, text: "Queijo", completed: false},
  ]);
  
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Card className="bg-black/20 border border-white/10 rounded-2xl backdrop-blur-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
              Compras
            </CardTitle>
             <CardDescription className="text-2xl font-bold text-white">{completedItems}/{totalItems}</CardDescription>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
            <ShoppingCart className="text-white" size={20}/>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">itens concluídos</p>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}
