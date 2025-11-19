'use client';

import { BottomNav } from "@/components/dashboard/bottom-nav";
import { ProjectCard } from "@/components/projects/project-card";
import { QuickAccessCard } from "@/components/projects/quick-access-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-100 dark:bg-zinc-900">
      <div className="relative z-10 flex flex-col min-h-screen text-gray-800 dark:text-white">
        <header className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-4xl font-thin tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
            Projetos
          </h1>
        </header>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28">
            <div className="w-full max-w-md space-y-4">
                <QuickAccessCard />
                <ProjectCard />
            </div>
        </main>
        
        <Link href="/tasks/new" passHref>
          <Button asChild className="fixed z-20 bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-100">
            <a><Plus size={32} /></a>
          </Button>
        </Link>

        <BottomNav active="produtividade" />
      </div>
    </div>
  );
}
