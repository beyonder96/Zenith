'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import type { Note } from '@/components/notes/notes';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const colorOptions = [
  'bg-white dark:bg-zinc-800',
  'bg-red-200 dark:bg-red-900/50',
  'bg-orange-200 dark:bg-orange-900/50',
  'bg-yellow-200 dark:bg-yellow-900/50',
  'bg-green-200 dark:bg-green-900/50',
  'bg-blue-200 dark:bg-blue-900/50',
  'bg-purple-200 dark:bg-purple-900/50',
];

export default function NewNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');


  const isEditing = noteId !== null;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && firestore) {
      const fetchNote = async () => {
        const docRef = doc(firestore, 'notes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const noteToEdit = {id: docSnap.id, ...docSnap.data()} as Note;
            setNoteId(noteToEdit.id);
            setTitle(noteToEdit.title);
            setContent(noteToEdit.content);
            setColor(noteToEdit.color || colorOptions[0]);
            setTags(noteToEdit.tags || []);
        }
      };
      fetchNote();
    }
  }, [searchParams, firestore]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };


  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Título é obrigatório.",
      });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário ou banco de dados não disponível' });
        return;
    }

    const noteData = {
        title,
        content,
        color,
        tags,
        userId: user.uid,
    };
    
    const operation = isEditing && noteId ? 'update' : 'create';
    
    let promise;

    if (isEditing && noteId) {
        const docRef = doc(firestore, 'notes', noteId);
        promise = updateDoc(docRef, {
            ...noteData,
            updatedAt: serverTimestamp(),
        });
    } else {
        promise = addDoc(collection(firestore, 'notes'), {
            ...noteData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    promise.then(() => {
        toast({
            title: isEditing ? "Nota atualizada!" : "Nota criada!",
        });
        if (!isEditing) {
          router.back();
        }
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: isEditing && noteId ? `notes/${noteId}` : 'notes',
            operation: operation,
            requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="link" onClick={() => router.back()} className="text-orange-500">
          Voltar
        </Button>
        <h1 className="font-bold text-lg">{isEditing ? 'Editar Nota' : 'Nova Nota'}</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Título da sua nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md text-lg font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            placeholder="Escreva sua nota aqui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md min-h-[300px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="Adicione tags (separadas por vírgula ou Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-background/50 p-0.5"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Cor da Nota</Label>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full ${c} border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
