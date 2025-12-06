'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Circle, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { ItemDetailsModal } from './item-details-modal';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';

export type ShoppingItem = {
  id: string;
  name: string;
  completed: boolean;
  quantity?: number;
  price?: number;
  userId: string;
};

type ShoppingListProps = {
  items: ShoppingItem[];
  setItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
};

export function ShoppingList() {
  const [newItem, setNewItem] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const itemsQuery = user && firestore ? query(collection(firestore, "shoppingItems"), where("userId", "==", user.uid)) : null;
  const { data: items, loading, hasMore, loadMore, setData: setItems } = useCollection<ShoppingItem>(itemsQuery, {
      limit: 15,
      orderBy: ['name', 'asc']
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddItem = async () => {
    if (newItem.trim() && user && firestore) {
      const itemData = {
        name: newItem.trim(),
        completed: false,
        userId: user.uid,
      };
      try {
        await addDoc(collection(firestore, 'shoppingItems'), itemData)
        setNewItem('');
      } catch (error: any) {
        console.error("Add item error:", error);
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
              path: 'shoppingItems',
              operation: 'create',
              requestResourceData: itemData,
          });
          errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao Adicionar',
            description: `Não foi possível adicionar o item. Detalhe: ${error.message}`
          });
        }
      }
    }
  };

  const handleToggleItem = (item: ShoppingItem) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'shoppingItems', item.id);
    
    if (item.completed) {
      const updateData = {
        completed: false,
      };
       updateDoc(itemRef, { ...updateData, price: null, quantity: null })
        .catch(error => {
          if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `shoppingItems/${item.id}`,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
          } else {
             toast({
              variant: 'destructive',
              title: 'Erro ao Desmarcar',
              description: `Não foi possível desmarcar o item. Detalhe: ${error.message}`
            });
          }
        });
    } else {
      setEditingItem(item);
    }
  };

  const handleConfirmDetails = (item: ShoppingItem, quantity: number, price: number) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'shoppingItems', item.id);
    const updateData = {
      completed: true,
      quantity,
      price,
    };
    updateDoc(itemRef, updateData)
      .then(() => {
        setEditingItem(null);
      })
      .catch(error => {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `shoppingItems/${item.id}`,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
          toast({
              variant: 'destructive',
              title: 'Erro ao Marcar',
              description: `Não foi possível marcar o item. Detalhe: ${error.message}`
            });
        }
        setEditingItem(null);
      });
  };

  const handleRemoveItem = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'shoppingItems', id);
    deleteDoc(docRef)
      .catch(error => {
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `shoppingItems/${id}`,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({
              variant: 'destructive',
              title: 'Erro ao Remover',
              description: `Não foi possível remover o item. Detalhe: ${error.message}`
            });
        }
      });
  };
  
  const formatQuantity = (quantity: number | undefined) => {
    if (!quantity) return '';
    if (quantity < 1) { // Assuming anything less than 1 is a weight in kg
        return `${quantity * 1000}g`;
    }
    return `${quantity}x`;
  }

  const sortedItems = [...items].sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || a.name.localeCompare(b.name));
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            placeholder="Adicionar novo item..."
            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 h-12 rounded-xl focus-visible:ring-orange-500 focus-visible:ring-offset-0 text-foreground"
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className="bg-orange-400 hover:bg-orange-500 text-white rounded-xl h-12 w-12"
            size="icon"
          >
            <Plus size={24} />
          </Button>
        </div>

        <Card className="bg-card dark:bg-zinc-800 border-none shadow-sm rounded-xl min-h-[300px]">
          <CardContent className="p-4 space-y-3">
            {!isClient || (loading && items.length === 0) ? (
              <div className="space-y-3 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 h-full py-16">
                <Star className="w-10 h-10 mb-4" />
                <p className="font-semibold">Sua lista está vazia.</p>
                <p className="text-sm">Adicione um item para começar!</p>
              </div>
            ) : (
              <>
                {sortedItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-background dark:bg-zinc-700/50 rounded-lg">
                    <button onClick={() => handleToggleItem(item)}>
                      {item.completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-400" />}
                    </button>
                    <div className="flex-grow">
                      <span className={cn('text-foreground', item.completed && 'line-through text-muted-foreground')}>
                        {item.name}
                      </span>
                      {item.completed && item.quantity && typeof item.price !== 'undefined' && (
                         <p className="text-xs text-muted-foreground">
                           {formatQuantity(item.quantity)} @ R$ {item.price.toFixed(2).replace('.',',')} = R$ {(item.quantity * item.price).toFixed(2).replace('.',',')}
                         </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRemoveItem(item.id)}
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                {hasMore && (
                  <Button onClick={loadMore} disabled={loading} className="w-full mt-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'Carregar mais'}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
      {editingItem && (
        <ItemDetailsModal
          item={editingItem}
          onConfirm={handleConfirmDetails}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
