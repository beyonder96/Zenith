'use client';

import { DateSelector } from "@/components/dashboard/date-selector";
import { FinanceCard } from "@/components/dashboard/finance-card";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ShoppingListCard } from "@/components/dashboard/shopping-list-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RelationshipCard } from "@/components/dashboard/relationship-card";
import { Heart, Gem } from "lucide-react";
import { NextEventCard } from "@/components/dashboard/next-event-card";

export default function Dashboard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="relative h-screen w-screen overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center p-4">
         <p>Carregando...</p>
       </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105" style={{ backgroundImage: "url('https://i.pinimg.com/originals/a1/83/83/a183833f4a38543d3513aa67c130b05b.jpg')" }}>
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
          <GreetingHeader />
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-8 pb-28 overflow-y-auto">
          <div className="text-center w-full">
            <h1
              className="mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-5xl font-light tracking-[0.3em] text-transparent animate-shine bg-[200%_auto]"
              style={{ animationDuration: '3s' }}
            >
              ZENITH
            </h1>
          </div>

          <div className="w-full max-w-md space-y-4 animate-pop-in">
            <DateSelector />
            <NextEventCard />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RelationshipCard 
                title="Dias Casados"
                icon={Gem}
                storageKey="weddingDate"
                unit="days"
              />
              <RelationshipCard 
                title="Tempo Juntos"
                icon={Heart}
                storageKey="togetherDate"
                unit="full"
              />
            </div>
            <FinanceCard />
            <ShoppingListCard />
            <TasksCard />
          </div>
        </main>

        <div className="flex-shrink-0">
          <BottomNav active="dashboard" />
        </div>
      </div>
    </div>
  );
}
