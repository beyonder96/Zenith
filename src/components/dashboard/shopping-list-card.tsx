"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

type ShoppingItem = {
  id: number;
  text: string;
  completed: boolean;
};

export function ShoppingListCard() {
  const [items] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping-list", []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;

  return (
    <Card className="bg-card text-card-foreground rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col">
            <CardTitle className="text-base font-semibold text-card-foreground/90">
              Lista de Compras
            </CardTitle>
        </div>
        <ShoppingCart className="text-muted-foreground" size={20}/>
      </CardHeader>
      <CardContent>
        {!isClient ? (
            <div className="space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-16" />
            </div>
        ) : items.length > 0 ? (
          <>
            <p className="text-2xl font-bold">{completedItems}/{totalItems}</p>
            <p className="text-xs text-muted-foreground">concluídos</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum item na lista.</p>
        )}
      </CardContent>
    </Card>
  );
}
