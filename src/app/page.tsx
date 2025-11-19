import { CoordinatesCard } from "@/components/dashboard/coordinates-card";
import { FinanceCard } from "@/components/dashboard/finance-card";
import { ShoppingListCard } from "@/components/dashboard/shopping-list-card";
import { TasksCard } from "@/components/dashboard/tasks-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl lg:text-5xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#FF9800]">
          Zenith Vision
        </h1>
        <p className="text-muted-foreground mt-2">Your personal dashboard for a visionary day.</p>
      </header>
      <main className="p-4 sm:p-6 lg:p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TasksCard />
          <ShoppingListCard />
          <FinanceCard />
          <CoordinatesCard />
        </div>
      </main>
    </div>
  );
}
