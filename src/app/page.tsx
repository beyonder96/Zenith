import { DateSelector } from "@/components/dashboard/date-selector";
import { FinanceCard } from "@/components/dashboard/finance-card";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingListCard } from "@/components/dashboard/shopping-list-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { CoordinatesDisplay } from "@/components/dashboard/coordinates-display";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        <GreetingHeader />
        <div className="text-center">
            <h1 className="text-6xl font-thin tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
              ZENITH
            </h1>
            <CoordinatesDisplay />
        </div>
        <DateSelector />
      </header>
      <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col gap-4 pb-24">
          <FinanceCard />
          <ShoppingListCard />
          <TasksCard />
      </main>
      <BottomNav />
    </div>
  );
}
