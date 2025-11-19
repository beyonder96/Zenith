"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Circle, CheckCircle2 } from "lucide-react";
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

  const handleClearList = () => {
    setItems([]);
  }

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Adicionar item..."
              className="bg-white/5 border-white/20 focus-visible:ring-orange-500 focus-visible:ring-offset-0 text-white"
            />
            <Button onClick={handleAddItem} className="bg-gradient-to-r from-orange-400 to-pink-500 text-white" size="icon">
              <Plus size={24} />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
          <p className="text-muted-foreground">{completedCount} de {items.length} itens comprados</p>
          <Button onClick={handleClearList} variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-400">
              <X className="mr-2 h-4 w-4" /> Limpar Lista
          </Button>
      </div>

      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardContent className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Sua lista de compras está vazia.</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                <button onClick={() => handleToggleItem(item.id)}>
                  {item.completed ? <CheckCircle2 className="text-orange-400" /> : <Circle className="text-muted-foreground" />}
                </button>
                <span className={cn("flex-grow text-white", item.completed && "line-through text-muted-foreground")}>
                  {item.name}
                </span>
                <Button onClick={() => handleRemoveItem(item.id)} variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:bg-white/10 hover:text-white">
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
