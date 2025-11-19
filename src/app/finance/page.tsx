'use client';

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { FinanceChart } from "@/components/finance/finance-chart";
import { TransactionList } from "@/components/finance/transaction-list";

export default function FinancePage() {
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
            Finanças
          </h1>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col gap-6 pb-28">
          <FinanceSummary />
          <FinanceChart />
          <TransactionList />
        </main>
        
        <Button className="fixed z-20 bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-100">
          <Plus size={32} />
        </Button>

        <BottomNav active="financas" />
      </div>
    </div>
  );
}
