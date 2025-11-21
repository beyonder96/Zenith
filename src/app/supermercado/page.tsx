'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingList, type ShoppingItem } from "@/components/shopping/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Trash2, Loader2 } from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function ShoppingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    if (user && firestore) {
      const q = query(collection(firestore, "shoppingItems"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userItems: ShoppingItem[] = [];
        querySnapshot.forEach((doc) => {
          userItems.push({ id: doc.id, ...doc.data() } as ShoppingItem);
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

  const totalCost = items.reduce((acc, item) => {
    if (item.completed && item.quantity && typeof item.price !== 'undefined') {
      return acc + (item.quantity * item.price);
    }
    return acc;
  }, 0);

  const hasCompletedItems = items.some(item => item.completed);

  const handleClearCompleted = () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    items.forEach(item => {
      if (item.completed) {
        batch.delete(doc(firestore, "shoppingItems", item.id));
      }
    });
    batch.commit()
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: 'shoppingItems',
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleFinishShopping = async () => {
    if (!firestore) return;
    const completedItems = items.filter(item => item.completed && item.price);
    if (completedItems.length === 0) {
        toast({
            variant: "destructive",
            title: "Nenhum item comprado",
            description: "Adicione o preço e a quantidade dos itens para finalizar.",
        });
        return;
    }

    const doc = new jsPDF();
    const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    doc.setFontSize(18);
    doc.text('Recibo da Compra', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 29);

    const tableColumn = ["Item", "Qtd.", "Preço Unit.", "Total"];
    const tableRows = completedItems.map(item => [
      item.name,
      item.quantity || 1,
      currencyFormatter.format(item.price || 0),
      currencyFormatter.format((item.price || 0) * (item.quantity || 1)),
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [251, 146, 60] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Gasto:', 14, finalY + 10);
    doc.text(currencyFormatter.format(totalCost), 200, finalY + 10, { align: 'right' });

    doc.save(`recibo-compra-${new Date().toISOString().split('T')[0]}.pdf`);

    // Clean up all items from the list in Firestore
    const batch = writeBatch(firestore);
    items.forEach(item => {
      batch.delete(doc(firestore, "shoppingItems", item.id));
    });
    await batch.commit()
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: 'shoppingItems',
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="relative min-h-screen w-full bg-background dark:bg-zinc-900 overflow-hidden">
       <div className="relative z-10 flex flex-col h-screen text-foreground">
        <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <h1 className="text-4xl font-light tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
            <div className="w-full max-w-md flex gap-4">
                <Button 
                    onClick={handleFinishShopping} 
                    disabled={!hasCompletedItems}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl text-base disabled:bg-gray-500 disabled:opacity-50"
                >
                    <Check className="mr-2 h-5 w-5"/> Finalizar
                </Button>
                <Button 
                    onClick={handleClearCompleted} 
                    disabled={!hasCompletedItems}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl text-base disabled:bg-gray-500 disabled:opacity-50"
                >
                    <Trash2 className="mr-2 h-5 w-5"/> Limpar Marcados
                </Button>
            </div>

            <Card className="w-full max-w-md bg-card dark:bg-zinc-800/50 border-none shadow-sm rounded-xl">
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total Gasto na Compra</p>
                     {!isClient ? (
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mt-1" />
                    ) : (
                        <p className="text-3xl font-bold text-foreground">R$ {totalCost.toFixed(2).replace('.', ',')}</p>
                    )}
                </CardContent>
            </Card>

            <div className="w-full max-w-md">
                <ShoppingList items={items} setItems={setItems} />
            </div>
        </main>
        
        <div className="flex-shrink-0">
          <BottomNav active="supermercado" />
        </div>
      </div>
    </div>
  );
}
