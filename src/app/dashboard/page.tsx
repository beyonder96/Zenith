import { DateSelector } from "@/components/dashboard/date-selector";
import { FinanceCard } from "@/components/dashboard/finance-card";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingListCard } from "@/components/dashboard/shopping-list-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { CoordinatesDisplay } from "@/components/dashboard/coordinates-display";

export default function Dashboard() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          <GreetingHeader />
          <div className="text-center">
            <h1
              className="mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-5xl font-thin tracking-[0.3em] text-transparent animate-shine bg-[200%_auto]"
              style={{ animationDuration: '3s' }}
            >
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
        <BottomNav active="dashboard" />
      </div>
    </div>
  );
}
