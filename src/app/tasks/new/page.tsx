'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Project, Subtask } from '@/components/projects/project-card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Textarea } from '@/components/ui/textarea';

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');


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
            setDetails(projectToEdit.details || '');
            setSubtasks(projectToEdit.subtasks || []);
            if (projectToEdit.dueDate) {
                setDate(parseISO(projectToEdit.dueDate));
            }
        }
      };
      fetchProject();
    }
  }, [searchParams, firestore]);

  const handleAddSubtask = () => {
    if (newSubtaskText.trim() !== '') {
        setSubtasks([...subtasks, { id: Date.now(), text: newSubtaskText, completed: false }]);
        setNewSubtaskText('');
    }
  };

  const handleRemoveSubtask = (id: number) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };


  const handleSave = async () => {
    if (!taskName.trim()) {
      toast({
        variant: "destructive",
        title: "Nome da tarefa é obrigatório.",
      });
      return;
    }
    if (!date) {
        toast({
          variant: "destructive",
          title: "Data de conclusão é obrigatória.",
        });
        return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário ou banco de dados não disponível' });
        return;
    }

    const projectData = {
        title: taskName,
        details: details,
        dueDate: format(date, 'yyyy-MM-dd'),
        completed: false,
        subtasks: subtasks,
        userId: user.uid,
    };
    
    const operation = isEditing && projectId ? 'update' : 'create';

    const promise = isEditing && projectId
      ? setDoc(doc(firestore, 'projects', projectId), projectData, { merge: true })
      : addDoc(collection(firestore, 'projects'), projectData);

    promise.then(() => {
        toast({
            title: isEditing ? "Projeto atualizado!" : "Projeto criado!",
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
          <Input
            id="taskName"
            placeholder="Nome da Tarefa"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="bg-card dark:bg-zinc-800 border-none rounded-md h-12 text-lg"
          />
        </div>
        
        <div className="space-y-2">
            <Textarea 
                id="details"
                placeholder="Adicionar detalhes"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
            />
        </div>

        <div className="space-y-4">
            <Label>Subtarefas</Label>
            <div className="space-y-2">
                {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2">
                        <Input 
                            value={subtask.text}
                            onChange={(e) => setSubtasks(subtasks.map(s => s.id === subtask.id ? {...s, text: e.target.value} : s))}
                            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSubtask(subtask.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                 <Input
                    placeholder="Nova subtarefa"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                />
                <Button onClick={handleAddSubtask} size="icon">
                    <Plus />
                </Button>
            </div>
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
      </main>
    </div>
  );
}
