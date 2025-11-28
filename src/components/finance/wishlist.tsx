'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export type WishlistItem = {
    id: string;
    name: string;
    link: string;
    price: number;
    category: string;
    importance: 'low' | 'medium' | 'high';
    imageUrl: string;
    userId: string;
};

const importanceMap = {
    low: { label: 'Baixa', color: 'bg-blue-500' },
    medium: { label: 'Média', color: 'bg-yellow-500' },
    high: { label: 'Alta', color: 'bg-red-500' },
};

export function Wishlist() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !firestore) {
      if (!user) setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(firestore, 'wishlistItems'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userItems: WishlistItem[] = [];
      snapshot.forEach((doc) => {
        userItems.push({ id: doc.id, ...doc.data() } as WishlistItem);
      });
      setItems(userItems);
      setLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({ path: 'wishlistItems', operation: 'list' });
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);
  
  const handleDeleteConfirm = () => {
    if (itemToDelete && firestore) {
        const docRef = doc(firestore, "wishlistItems", itemToDelete);
        deleteDoc(docRef).then(() => {
            toast({ title: "Item removido da lista de desejos." });
            setItemToDelete(null);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: `wishlistItems/${itemToDelete}`, operation: 'delete' });
            errorEmitter.emit('permission-error', permissionError);
            setItemToDelete(null);
        })
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card/50 rounded-xl">
        <p className="font-semibold">Sua lista de desejos está vazia!</p>
        <p className="text-sm">Clique no botão '+' para adicionar um item.</p>
      </div>
    );
  }

  return (
    <>
        <div className="w-full max-w-lg space-y-4">
            {items.map((item) => (
                <Card key={item.id} className="w-full bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0 flex">
                       <div className="w-1/3 flex items-center justify-center bg-white/5 p-2">
                         <Image src={item.imageUrl} alt={item.name} width={120} height={120} className="object-contain" />
                       </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-bold text-lg leading-tight hover:underline pr-2">
                                        {item.name}
                                    </a>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-red-500 hover:bg-red-500/10" onClick={() => setItemToDelete(item.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <p className="text-xl font-semibold text-cyan-400">
                                    {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                                <Badge className={cn("text-xs font-bold", importanceMap[item.importance].color)}>
                                    {importanceMap[item.importance].label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
        <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação removerá o item da sua lista de desejos permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Remover</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
