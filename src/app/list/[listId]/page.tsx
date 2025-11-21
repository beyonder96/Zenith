'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ListX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type SharedShoppingItem = {
  name: string;
  completed: boolean;
};

type SharedList = {
  items: SharedShoppingItem[];
  ownerId: string;
};

export default function SharedListPage({ params }: { params: { listId: string } }) {
  const firestore = useFirestore();
  const [list, setList] = useState<SharedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { listId } = params;

  useEffect(() => {
    if (!firestore || !listId) return;

    setLoading(true);
    const docRef = doc(firestore, 'sharedLists', listId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SharedList;
           // Sort items by completed status and then by name
          data.items.sort((a, b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || a.name.localeCompare(b.name));
          setList(data);
          setError(null);
        } else {
          setError('Esta lista de compras não foi encontrada ou foi excluída.');
          setList(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching shared list:', err);
        setError('Ocorreu um erro ao carregar a lista. Verifique o link e sua conexão.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, listId]);

  const handleToggleItem = async (itemName: string) => {
    if (!firestore || !list) return;

    const updatedItems = list.items.map((item) =>
      item.name === itemName ? { ...item, completed: !item.completed } : item
    );

    const docRef = doc(firestore, 'sharedLists', listId);
    try {
      await updateDoc(docRef, { items: updatedItems });
    } catch (err) {
      console.error('Error updating shared list:', err);
      // Optionally, show a toast to the user
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando lista de compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
        <ListX className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Oops!</h1>
        <p className="text-muted-foreground max-w-sm">{error}</p>
         <Button asChild className="mt-8">
            <Link href="/dashboard">Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1
          className="mb-6 bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-4xl font-light tracking-[0.2em] text-transparent text-center"
          style={{ animationDuration: '3s' }}
        >
          LISTA COMPARTILHADA
        </h1>
        <Card className="bg-card dark:bg-zinc-800 border-none shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground font-normal">
              Marque os itens que você pegar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-6">
            {list?.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Esta lista está vazia!</p>
            ) : (
                list?.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-background dark:bg-zinc-700/50 rounded-lg transition-colors duration-200"
              >
                <Checkbox
                  id={`item-${index}`}
                  checked={item.completed}
                  onCheckedChange={() => handleToggleItem(item.name)}
                  className="h-6 w-6 rounded-md border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor={`item-${index}`}
                  className={cn(
                    'flex-grow text-lg font-medium leading-none cursor-pointer transition-colors',
                    item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {item.name}
                </label>
              </div>
            )))}
          </CardContent>
        </Card>
         <p className="text-center text-xs text-muted-foreground mt-4">
          Esta é uma lista em tempo real. As alterações são salvas e vistas por todos instantaneamente.
        </p>
      </div>
    </div>
  );
}
