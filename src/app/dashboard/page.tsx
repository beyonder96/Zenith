import { DateSelector } from "@/components/dashboard/date-selector";
import { FinanceCard } from "@/components/dashboard/finance-card";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingListCard } from "@/components/dashboard/shopping-list-card";
import { TasksCard } from "@/components/dashboard/tasks-card";

export default function Dashboard() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        style={{ backgroundImage: "url('https://picsum.photos/seed/mountain/1920/1080')" }}
        data-ai-hint="mountain landscape"
      ></div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
          <GreetingHeader />
          <DateSelector />
        </header>
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col gap-4 pb-24">
            <FinanceCard />
            <ShoppingListCard />
            <TasksCard />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
