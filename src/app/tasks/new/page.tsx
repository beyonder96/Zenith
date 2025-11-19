'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Importance = 'Baixa' | 'Média' | 'Alta';

export default function NewTaskPage() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [importance, setImportance] = useState<Importance>('Baixa');
  const [isRecurrent, setIsRecurrent] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-zinc-900 min-h-screen text-gray-800 dark:text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
        <Button variant="link" onClick={() => router.back()} className="text-orange-500">
          Cancelar
        </Button>
        <h1 className="font-bold text-lg">Nova Tarefa</h1>
        <Button variant="link" onClick={() => { /* Lógica para salvar */ }} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-8">
        <div className="space-y-2">
          <Label htmlFor="taskName">Tarefa</Label>
          <Input
            id="taskName"
            placeholder="Ex: Preparar relatório trimestral"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label>Data de Conclusão</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 rounded-md',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Importância</Label>
          <div className="flex gap-2">
            {(['Baixa', 'Média', 'Alta'] as Importance[]).map((level) => (
              <Button
                key={level}
                variant={importance === level ? 'default' : 'outline'}
                onClick={() => setImportance(level)}
                className={cn(
                  'flex-1 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700',
                  importance === level && 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-md">
          <Label htmlFor="recurrent-task" className="m-0">Tarefa Recorrente</Label>
          <Switch
            id="recurrent-task"
            checked={isRecurrent}
            onCheckedChange={setIsRecurrent}
          />
        </div>
      </main>
    </div>
  );
}
