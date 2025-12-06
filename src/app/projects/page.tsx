'use client';

import { useState } from 'react';
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, ListTodo, CalendarDays, Search, Home } from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { PetsSection } from '@/components/casa/pets-section';
import { useProjects } from './hooks/useProjects';
import { useNotes } from './hooks/useNotes';
import { useEvents } from './hooks/useEvents';
import { useSearchAndFilter } from './hooks/useSearchAndFilter';
import { ProjectsView } from './components/ProjectsView';
import { NotesView } from './components/NotesView';
import { EventsView } from './components/EventsView';

export default function ProjectsPage() {
  const [activeView, setActiveView] = useState<'projects' | 'notes' | 'events' | 'casa'>('projects');
  
  const { projects, loading: loadingProjects } = useProjects();
  const { notes, loading: loadingNotes } = useNotes();
  const { events, loading: loadingEvents } = useEvents();

  const {
    searchTerm,
    setSearchTerm,
    filteredProjects,
    filteredNotes,
    filteredEvents
  } = useSearchAndFilter({ projects, notes, events });
  
  const navItems = [
    { id: 'projects', label: 'Tarefas', icon: ListTodo },
    { id: 'notes', label: 'Notas', icon: StickyNote },
    { id: 'events', label: 'Eventos', icon: CalendarDays },
    { id: 'casa', label: 'Casa', icon: Home }
  ] as const;

  const renderContent = () => {
    switch(activeView) {
      case 'projects':
        return <ProjectsView projects={filteredProjects} loading={loadingProjects} searchTerm={searchTerm} />;
      case 'notes':
        return <NotesView notes={filteredNotes} loading={loadingNotes} searchTerm={searchTerm} />;
      case 'events':
        return <EventsView events={filteredEvents} loading={loadingEvents} searchTerm={searchTerm} />;
      case 'casa':
        return <PetsSection />;
      default:
        return null;
    }
  }

  return (
      <div className="relative min-h-screen w-full bg-gray-100 dark:bg-zinc-900 overflow-hidden">
        <div className="relative z-10 flex flex-col h-screen text-gray-800 dark:text-white">
          <header className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
            <h1 className="text-4xl font-light tracking-wider text-center bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
              Produtividade
            </h1>
          </header>
          
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0 flex flex-col items-center gap-4 pb-28 overflow-y-auto">
              <div className="w-full max-w-md">
                 <div className="relative w-full max-w-md mb-4">
                    <Input
                        placeholder="Pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-card/30 dark:bg-black/20 border-none rounded-full h-11 backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 </div>

                 <div className="flex w-full items-center justify-center gap-2 mb-4">
                  {navItems.map(item => (
                     <Button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      variant={activeView === item.id ? 'default' : 'ghost'}
                      className={cn(
                        'rounded-full px-4 transition-all',
                        activeView === item.id ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black' : 'bg-gray-200 dark:bg-zinc-800'
                      )}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
                
                {renderContent()}
              </div>
          </main>
          
          <div className="fixed z-20 bottom-28 right-6 flex items-center gap-2">
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/tasks/new">
                    <ListTodo className="mr-2 h-4 w-4" /> Tarefa
                </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/notes/new">
                    <StickyNote className="mr-2 h-4 w-4" /> Nota
                </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-full shadow-lg">
                <Link href="/events/new">
                    <CalendarDays className="mr-2 h-4 w-4" /> Evento
                </Link>
            </Button>
          </div>
          
          <div className="flex-shrink-0">
            <BottomNav active="produtividade" />
          </div>
        </div>
      </div>
  );
}
