"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
};

export function FinanceCard() {
  const [entries, setEntries] = useLocalStorage<FinanceEntry[]>("zenith-vision-finance", []);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (description.trim() && !isNaN(numAmount)) {
      setEntries([
        ...entries,
        { id: Date.now(), description: description.trim(), amount: numAmount },
      ]);
      setDescription("");
      setAmount("");
    }
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <DollarSign className="text-accent" />
          Daily Finance
        </CardTitle>
        <CardDescription>A summary of today's financial activities.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <form onSubmit={handleAddEntry} className="flex gap-2">
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-32"
          />
          <Button type="submit" size="icon" aria-label="Add finance entry">
            <Plus />
          </Button>
        </form>
        <Separator />
        <ScrollArea className="flex-grow h-48">
          <div className="pr-4">
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No entries for today.</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between text-sm transition-all animate-in fade-in-0 slide-in-from-top-2 duration-300 group">
                    <span className="truncate pr-2">{entry.description}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${entry.amount >= 0 ? '' : 'text-destructive'}`}>
                        {entry.amount >= 0 ? '+' : ''}{entry.amount.toFixed(2)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteEntry(entry.id)} aria-label={`Delete ${entry.description}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex justify-between items-center font-bold text-lg">
          <span>Total:</span>
          <span className="font-mono">{total.toFixed(2)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
