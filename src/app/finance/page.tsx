'use client';

import { useState } from "react";
import { Plus, PiggyBank, LayoutGrid, FileText, Landmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { FinanceSummary } from "@/components/finance/finance-summary";
import { FinanceChart } from "@/components/finance/finance-chart";
import { TransactionList } from "@/components/finance/transaction-list";
import Link from "next/link";
import { GoalsList } from "@/components/finance/goals-list";
import { cn } from "@/lib/utils";
import { StatementOptionsDialog } from "@/components/finance/statement-options-dialog";
import { SavingsList } from "@/components/finance/savings-list";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CategoryChart } from "@/components/finance/category-chart";

export default function FinancePage() {
  const [activeView, setActiveView] = useState<'overview' | 'goals' | 'savings'>('overview');
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);

  const getFabLink = () => {
    switch (activeView) {
      case 'goals':
        return "/finance/goals/new";
      case 'savings':
        return "/finance/goals"; // Maybe link to goals page to deposit
      case 'overview':
      default:
        return "/finance/new";
    }
  }

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
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="text-foreground/80">
                <Link href="/finance/categories"><Settings /></Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsStatementDialogOpen(true)} className="text-foreground/80">
                  <FileText />
              </Button>
            </div>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-6 pb-28 overflow-y-auto">
            <div className="w-full max-w-lg">
                <div className="flex w-full items-center justify-center gap-2 mb-6">
                    <Button
                        onClick={() => setActiveView('overview')}
                        variant={activeView === 'overview' ? 'default' : 'ghost'}
                        className={cn(
                        'rounded-full px-4 sm:px-6 transition-all flex items-center gap-2 text-xs sm:text-sm',
                        activeView === 'overview' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                        )}
                    >
                        <LayoutGrid size={16} /> Visão Geral
                    </Button>
                    <Button
                        onClick={() => setActiveView('goals')}
                        variant={activeView === 'goals' ? 'default' : 'ghost'}
                        className={cn(
                        'rounded-full px-4 sm:px-6 transition-all flex items-center gap-2 text-xs sm:text-sm',
                        activeView === 'goals' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                        )}
                    >
                        <PiggyBank size={16} /> Metas
                    </Button>
                     <Button
                        onClick={() => setActiveView('savings')}
                        variant={activeView === 'savings' ? 'default' : 'ghost'}
                        className={cn(
                        'rounded-full px-4 sm:px-6 transition-all flex items-center gap-2 text-xs sm:text-sm',
                        activeView === 'savings' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                        )}
                    >
                        <Landmark size={16} /> Poupança
                    </Button>
                </div>

                {activeView === 'overview' && (
                    <div className="space-y-6">
                        <FinanceSummary />
                        <Carousel>
                            <CarouselContent>
                                <CarouselItem>
                                    <FinanceChart />
                                </CarouselItem>
                                <CarouselItem>
                                    <CategoryChart />
                                </CarouselItem>
                            </CarouselContent>
                        </Carousel>
                        <TransactionList />
                    </div>
                )}

                {activeView === 'goals' && (
                   <GoalsList />
                )}
                
                {activeView === 'savings' && (
                    <SavingsList />
                )}
            </div>
          </main>
          
          <Button asChild className="fixed z-20 bottom-28 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-100">
            <Link href={getFabLink()}>
              <Plus size={32} />
            </Link>
          </Button>

          <div className="flex-shrink-0">
            <BottomNav active="financas" />
          </div>
        </div>
      </div>
      <StatementOptionsDialog open={isStatementDialogOpen} onOpenChange={setIsStatementDialogOpen} />
    </>
  );
}
