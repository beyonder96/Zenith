"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Circle, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ShoppingItem = {
  id: number;
  name: string;
  completed: boolean;
};

export function ShoppingList() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping-list", []);
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), name: newItem.trim(), completed: false }]);
      setNewItem("");
    }
  };
  
  const handleToggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
        <div className="flex gap-2">
            <Input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder="Adicionar novo item..."
            className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 h-12 rounded-xl focus-visible:ring-orange-500 focus-visible:ring-offset-0 text-gray-800 dark:text-white"
            />
            <Button onClick={handleAddItem} className="bg-orange-400 hover:bg-orange-500 text-white rounded-xl h-12 w-12" size="icon">
                <Plus size={24} />
            </Button>
        </div>

      <Card className="bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl min-h-[300px]">
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 h-full py-16">
                <Star className="w-10 h-10 mb-4"/>
                <p className="font-semibold">Sua lista está vazia.</p>
                <p className="text-sm">Adicione um item para começar!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-700/50 rounded-lg">
                <button onClick={() => handleToggleItem(item.id)}>
                  {item.completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-400" />}
                </button>
                <span className={cn("flex-grow text-gray-800 dark:text-white", item.completed && "line-through text-gray-400 dark:text-gray-500")}>
                  {item.name}
                </span>
                <Button onClick={() => handleRemoveItem(item.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-gray-400 hover:bg-red-500/10 hover:text-red-500">
                  <X size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
