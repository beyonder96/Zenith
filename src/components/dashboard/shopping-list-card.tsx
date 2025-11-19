"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ShoppingItem = {
  id: number;
  text: string;
  completed: boolean;
};

export function ShoppingListCard() {
  const [items, setItems] = useLocalStorage<ShoppingItem[]>("zenith-vision-shopping", []);
  const [newItem, setNewItem] = useState("");

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem.trim(), completed: false }]);
      setNewItem("");
    }
  };

  const handleToggleItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };
  
  const handleDeleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <ShoppingCart className="text-accent" />
          Shopping List
        </CardTitle>
        <CardDescription>Your list of items to buy.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <Button type="submit" size="icon" aria-label="Add shopping item">
            <Plus />
          </Button>
        </form>
        <Separator />
        <ScrollArea className="flex-grow h-64">
          <div className="pr-4">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Your shopping list is empty.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 transition-all animate-in fade-in-0 slide-in-from-top-2 duration-300 group">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      aria-label={item.text}
                    />
                    <label
                      htmlFor={`item-${item.id}`}
                      className={`flex-grow text-sm cursor-pointer transition-colors ${
                        item.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.text}
                    </label>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id)} aria-label={`Delete ${item.text}`}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
