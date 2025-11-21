'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Project } from '@/components/projects/project-card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type Importance = 'Baixa' | 'Média' | 'Alta';
type RecurrenceFrequency = 'diario' | 'semanal' | 'mensal' | 'anual';

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [importance, setImportance] = useState<Importance>('Baixa');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>('mensal');

  const isEditing = projectId !== null;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && firestore) {
      const fetchProject = async () => {
        const docRef = doc(firestore, 'projects', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const projectToEdit = {id: docSnap.id, ...docSnap.data()} as Project;
            setProjectId(projectToEdit.id);
            setTaskName(projectToEdit.title);
            if (projectToEdit.dueDate) {
                setDate(parseISO(projectToEdit.dueDate));
            }
        }
      };
      fetchProject();
    }
  }, [searchParams, firestore]);

  const handleSave = async () => {
    if (!taskName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome da tarefa é obrigatório.",
        description: "Por favor, dê um nome para sua tarefa.",
      });
      return;
    }
    if (!date) {
        toast({
          variant: "destructive",
          title: "Data de conclusão é obrigatória.",
          description: "Por favor, selecione uma data.",
        });
        return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário ou banco de dados não disponível' });
        return;
    }

    const projectData = {
        title: taskName,
        dueDate: format(date, 'yyyy-MM-dd'),
        completed: false,
        subtasks: [],
        userId: user.uid,
    };
    
    const operation = isEditing && projectId ? 'update' : 'create';

    const promise = isEditing && projectId
      ? setDoc(doc(firestore, 'projects', projectId), projectData, { merge: true })
      : addDoc(collection(firestore, 'projects'), projectData);

    promise.then(() => {
        toast({
            title: isEditing ? "Projeto atualizado!" : "Projeto criado!",
            description: isEditing ? "Suas alterações foram salvas." : "O novo projeto foi adicionado à sua lista.",
        });
        router.push('/projects');
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: isEditing && projectId ? `projects/${projectId}` : 'projects',
            operation: operation,
            requestResourceData: projectData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const importanceColors = {
    Baixa: 'bg-green-500 text-white border-green-500 hover:bg-green-600',
    Média: 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600',
    Alta: 'bg-red-500 text-white border-red-500 hover:bg-red-600'
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="link" onClick={() => router.back()} className="text-orange-500">
          Cancelar
        </Button>
        <h1 className="font-bold text-lg">{isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
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
            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
          />
        </div>

        <div className="space-y-2">
          <Label>Data de Conclusão</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md',
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
                  'flex-1',
                  importance === level 
                    ? importanceColors[level] 
                    : 'bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 text-foreground'
                )}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-4 bg-card dark:bg-zinc-800 rounded-md">
          <div className="flex items-center justify-between">
            <Label htmlFor="recurrent-task" className="m-0">Tarefa Recorrente</Label>
            <Switch
              id="recurrent-task"
              checked={isRecurrent}
              onCheckedChange={setIsRecurrent}
            />
          </div>
           {isRecurrent && (
                <div className="space-y-2 pt-4 border-t border-border dark:border-zinc-700">
                    <Label>Frequência</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['diario', 'semanal', 'mensal', 'anual'] as RecurrenceFrequency[]).map((freq) => (
                            <Button
                                key={freq}
                                variant={recurrenceFrequency === freq ? 'default' : 'outline'}
                                onClick={() => setRecurrenceFrequency(freq)}
                                className={cn(
                                'capitalize',
                                recurrenceFrequency === freq 
                                    ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                                    : 'bg-muted dark:bg-zinc-700 border-border dark:border-zinc-600 text-foreground hover:bg-accent dark:hover:bg-zinc-600 dark:text-white'
                                )}
                            >
                                {freq}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
