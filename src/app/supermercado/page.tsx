'use client';

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingList } from "@/components/shopping/shopping-list";

export default function ShoppingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.pinimg.com/originals/a1/83/83/a183833f4a38543d3513aa67c130b05b.jpg')" }}
        data-ai-hint="mountain landscape"
      ></div>
      <div className="absolute inset-0 bg-gray-900/10 dark:bg-black/10 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col min-h-screen text-white">
        <header className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-4xl font-thin tracking-wider bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col gap-6 pb-28">
          <ShoppingList />
        </main>
        
        <BottomNav active="supermercado" />
      </div>
    </div>
  );
}
