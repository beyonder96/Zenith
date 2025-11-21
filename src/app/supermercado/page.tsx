'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingList, type ShoppingItem } from "@/components/shopping/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Trash2, Loader2, Share2 } from "lucide-react";
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
        setItems(userItems.sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || a.name.localeCompare(b.name)));
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
  const hasPendingItems = items.some(item => !item.completed);

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
  
  const handleShareList = () => {
    const uncompletedItems = items.filter(item => !item.completed);

    if (uncompletedItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum item pendente",
        description: "Não há itens para compartilhar na lista.",
      });
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Lista de Compras', 14, 22);
    doc.setFontSize(11);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 29);

    const tableColumn = ["Item"];
    const tableRows = uncompletedItems.map(item => [item.name]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'striped',
      headStyles: { fillColor: [251, 146, 60] },
      bodyStyles: {
        cellPadding: 3,
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0) {
           const text = data.cell.text[0]; // Get the item text
           data.cell.text = []; // Clear the original text to prevent it from being drawn by autotable
           // Draw a square for checkbox
           doc.rect(data.cell.x + 2, data.cell.y + data.cell.height / 2 - 2, 4, 4);
           // Redefine cell text position
           doc.text(text, data.cell.x + 8, data.cell.y + data.cell.height / 2 + 2);
        }
      }
    });

    doc.save(`lista-de-compras-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <div className="w-full max-w-md grid grid-cols-2 gap-4">
                <Button 
                    onClick={handleShareList} 
                    disabled={!hasPendingItems}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12 rounded-xl text-base disabled:bg-gray-500 disabled:opacity-50"
                >
                    <Share2 className="mr-2 h-5 w-5"/> Compartilhar
                </Button>
                <Button 
                    onClick={handleClearCompleted} 
                    disabled={!hasCompletedItems}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl text-base disabled:bg-gray-500 disabled:opacity-50"
                >
                    <Trash2 className="mr-2 h-5 w-5"/> Limpar Marcados
                </Button>
                <Button 
                    onClick={handleFinishShopping} 
                    disabled={!hasCompletedItems}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl text-base disabled:bg-gray-500 disabled:opacity-50 col-span-2"
                >
                    <Check className="mr-2 h-5 w-5"/> Finalizar Compra e Gerar Recibo
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
