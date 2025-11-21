'use client';

import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { FinanceChart } from "@/components/finance/finance-chart";
import { TransactionList } from "@/components/finance/transaction-list";
import Link from "next/link";
import { StatementOptionsDialog } from "@/components/finance/statement-options-dialog";

export default function FinancePage() {
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);

  return (
    <>
      <div className="relative min-h-screen w-full bg-background dark:bg-zinc-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://i.pinimg.com/originals/a1/83/83/a183833f4a38543d3513aa67c130b05b.jpg')" }}
          data-ai-hint="mountain landscape"
        ></div>
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col h-screen text-foreground">
          <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0 flex items-center justify-between">
            <h1 className="text-4xl font-light tracking-wider bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Finanças
            </h1>
            <Button variant="ghost" size="icon" onClick={() => setIsStatementDialogOpen(true)} className="text-foreground/80 hover:text-foreground hover:bg-white/10 dark:hover:bg-black/20">
              <FileText size={24} />
            </Button>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col gap-6 pb-28 overflow-y-auto">
            <FinanceSummary />
            <FinanceChart />
            <TransactionList />
          </main>
          
          <Button asChild className="fixed z-20 bottom-28 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-100">
            <Link href="/finance/new">
              <Plus size={32} />
            </Link>
          </Button>

          <div className="flex-shrink-0">
            <BottomNav active="financas" />
          </div>
        </div>
      </div>
      <StatementOptionsDialog 
        open={isStatementDialogOpen}
        onOpenChange={setIsStatementDialogOpen}
      />
    </>
  );
}
