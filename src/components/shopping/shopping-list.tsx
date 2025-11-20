'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Circle, CheckCircle2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { ItemDetailsModal } from './item-details-modal';

export type ShoppingItem = {
  id: number;
  name: string;
  completed: boolean;
  quantity?: number;
  price?: number;
};

export function ShoppingList() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>('zenith-vision-shopping-list', []);
  const [newItem, setNewItem] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), name: newItem.trim(), completed: false }]);
      setNewItem('');
    }
  };

  const handleToggleItem = (item: ShoppingItem) => {
    // If the item is already completed, un-complete it and clear details
    if (item.completed) {
      const updatedItem = { ...item, completed: false, quantity: undefined, price: undefined };
      setItems(items.map(i => (i.id === item.id ? updatedItem : i)));
    } else {
      // If the item is not completed, open the modal to add details
      setEditingItem(item);
    }
  };

  const handleConfirmDetails = (item: ShoppingItem, quantity: number, price: number) => {
    const updatedItem = { ...item, completed: true, quantity, price };
    setItems(items.map(i => (i.id === item.id ? updatedItem : i)));
    setEditingItem(null);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
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
            className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 h-12 rounded-xl focus-visible:ring-orange-500 focus-visible:ring-offset-0 text-gray-800 dark:text-white"
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

        <Card className="bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl min-h-[300px]">
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
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                  <button onClick={() => handleToggleItem(item)}>
                    {item.completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-400" />}
                  </button>
                  <div className="flex-grow">
                    <span className={cn('text-gray-800 dark:text-white', item.completed && 'line-through text-gray-400 dark:text-gray-500')}>
                      {item.name}
                    </span>
                    {item.completed && item.quantity && typeof item.price !== 'undefined' && (
                       <p className="text-xs text-gray-400 dark:text-gray-500">
                         {item.quantity} x R$ {item.price.toFixed(2)} = R$ {(item.quantity * item.price).toFixed(2)}
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
