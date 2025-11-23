"use client";

import { useFirestore, useUser } from "@/firebase";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import Link from "next/link";


type ShoppingItem = {
  id: string;
  text: string;
  completed: boolean;
};

export function ShoppingListCard() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const q = query(collection(firestore, "shoppingItems"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userItems: ShoppingItem[] = [];
        snapshot.forEach(doc => {
          userItems.push({ id: doc.id, ...doc.data()} as ShoppingItem)
        });
        setItems(userItems);
      },
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'shoppingItems',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribe();
    }
  }, [user, firestore]);

  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;

  return (
    <Link href="/supermercado" className="block transition-transform hover:scale-[1.02]">
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
    </Link>
  );
}
