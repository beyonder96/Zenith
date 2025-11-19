'use client';

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingList } from "@/components/shopping/shopping-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Trash2 } from "lucide-react";

export default function ShoppingPage() {
  return (
    <div className="relative min-h-screen w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen text-gray-800 dark:text-white">
        <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <h1 className="text-4xl font-thin tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
            <div className="w-full max-w-md flex gap-4">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 rounded-xl text-base">
                    <Check className="mr-2 h-5 w-5"/> Finalizar
                </Button>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl text-base">
                    <Trash2 className="mr-2 h-5 w-5"/> Limpar
                </Button>
            </div>

            <Card className="w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl">
                <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Gasto na Compra</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">R$ 0,00</p>
                </CardContent>
            </Card>

            <div className="w-full max-w-md">
                <ShoppingList />
            </div>
        </main>
        
        <div className="flex-shrink-0">
          <BottomNav active="supermercado" />
        </div>
      </div>
    </div>
  );
}
