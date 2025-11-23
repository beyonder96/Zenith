'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingList, type ShoppingItem } from "@/components/shopping/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Trash2, Loader2, Link2, FileDown } from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, writeBatch, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function ShoppingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

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
  
  const handleShareList = async () => {
    if (!firestore || !user) return;
    
    const pendingItems = items
      .filter(item => !item.completed)
      .map(({ name, completed }) => ({ name, completed }));

    if (pendingItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum item pendente",
        description: "Adicione itens à lista antes de compartilhar.",
      });
      return;
    }

    setIsSharing(true);

    try {
      const sharedListData = {
        items: pendingItems,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(firestore, "sharedLists"), sharedListData);
      const shareLink = `${window.location.origin}/list/${docRef.id}`;
      
      await navigator.clipboard.writeText(shareLink);
      
      toast({
        title: "Link copiado!",
        description: "O link para sua lista de compras foi copiado para a área de transferência.",
      });

    } catch (error) {
      console.error("Error sharing list: ", error);
      toast({
        variant: "destructive",
        title: "Erro ao compartilhar",
        description: "Não foi possível criar o link compartilhável. Tente novamente.",
      });
      if (error instanceof Error && error.message.includes('permission-denied')) {
          const permissionError = new FirestorePermissionError({
            path: 'sharedLists',
            operation: 'create',
            requestResourceData: { ownerId: user.uid },
          });
          errorEmitter.emit('permission-error', permissionError);
      }
    } finally {
        setIsSharing(false);
    }
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
        <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0 flex flex-col items-center gap-4">
          <h1 className="text-4xl font-light tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
          <TooltipProvider>
            <div className="flex items-center gap-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleShareList} disabled={!hasPendingItems || isSharing} className="w-16 h-16 bg-card dark:bg-zinc-800 rounded-full shadow-md">
                           {isSharing ? <Loader2 className="h-7 w-7 animate-spin"/> : <Link2 className="h-7 w-7"/>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copiar Link da Lista</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" onClick={handleClearCompleted} disabled={!hasCompletedItems} className="w-16 h-16 bg-card dark:bg-zinc-800 rounded-full shadow-md">
                            <Trash2 className="h-7 w-7"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Limpar Itens Marcados</p>
                    </TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleFinishShopping} disabled={!hasCompletedItems} className="w-16 h-16 bg-card dark:bg-zinc-800 rounded-full shadow-md">
                            <FileDown className="h-7 w-7"/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Finalizar e Gerar Recibo (PDF)</p>
                    </TooltipContent>
                </Tooltip>
            </div>
          </TooltipProvider>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
            
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
