'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Circle, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { ItemDetailsModal } from './item-details-modal';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

export function ShoppingList({ items, setItems }: ShoppingListProps) {
  const [newItem, setNewItem] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddItem = () => {
    if (newItem.trim() && user && firestore) {
      const itemData = {
        name: newItem.trim(),
        completed: false,
        userId: user.uid,
      };
      addDoc(collection(firestore, 'shoppingItems'), itemData)
        .then(() => {
          setNewItem('');
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
              path: 'shoppingItems',
              operation: 'create',
              requestResourceData: itemData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const handleToggleItem = (item: ShoppingItem) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'shoppingItems', item.id);
    
    if (item.completed) {
      const updateData = {
        completed: false,
        quantity: undefined,
        price: undefined,
      };
      updateDoc(itemRef, updateData)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: `shoppingItems/${item.id}`,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
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
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `shoppingItems/${item.id}`,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
        setEditingItem(null);
      });
  };

  const handleRemoveItem = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'shoppingItems', id);
    deleteDoc(docRef)
      .catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `shoppingItems/${id}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
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
            {!isClient ? (
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
              items.map(item => (
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
                         {item.quantity} x R$ {item.price.toFixed(2).replace('.',',')} = R$ {(item.quantity * item.price).toFixed(2).replace('.',',')}
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
              ))
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
