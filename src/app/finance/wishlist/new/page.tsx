'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getProductInfoFromUrl } from '@/app/actions';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';

const defaultCategories = {
  expense: ['Eletrônicos', 'Vestuário', 'Casa', 'Hobbies', 'Viagem', 'Outros'],
  income: [], // Not used here but kept for consistency with hook
};

export default function NewWishlistItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [link, setLink] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high' | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [storedCategories] = useLocalStorage('user-categories', defaultCategories);

  const handleFetchInfo = async () => {
    if (!link.trim() || !URL.canParse(link)) {
      toast({ variant: 'destructive', title: 'URL Inválida', description: 'Por favor, insira um link de produto válido.' });
      return;
    }
    setIsFetching(true);
    const result = await getProductInfoFromUrl(link);
    setIsFetching(false);

    if (result.success && result.productInfo) {
      const { name, price, imageUrl } = result.productInfo;
      setName(name);
      setPrice(String(price));
      setImageUrl(imageUrl);
      toast({ title: 'Informações do produto extraídas com sucesso!' });
    } else {
      toast({ variant: 'destructive', title: 'Falha ao extrair', description: result.error || 'Não foi possível buscar as informações do link.' });
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !link.trim() || !category || !importance || !imageUrl) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Todos os campos devem ser preenchidos." });
      return;
    }
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Usuário não autenticado.' });
      return;
    }
    
    setIsSaving(true);

    const numericPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numericPrice) || numericPrice < 0) {
      toast({ variant: "destructive", title: "Preço inválido", description: "Insira um valor numérico para o preço." });
      setIsSaving(false);
      return;
    }

    const wishlistItemData = {
      name,
      link,
      price: numericPrice,
      category,
      importance,
      imageUrl,
      userId: user.uid,
    };

    try {
      await addDoc(collection(firestore, 'wishlistItems'), wishlistItemData);
      toast({ title: "Item adicionado à sua lista de desejos!" });
      router.push('/finance');
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: 'wishlistItems',
        operation: 'create',
        requestResourceData: wishlistItemData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">Novo Desejo</h1>
        <Button variant="link" onClick={handleSave} disabled={isSaving} className="font-bold text-orange-500">
          {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar'}
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="link">Link do Produto</Label>
          <div className="flex gap-2">
            <Input
              id="link"
              placeholder="Cole a URL do produto aqui"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700"
            />
            <Button size="icon" onClick={handleFetchInfo} disabled={isFetching}>
              {isFetching ? <Loader2 className="animate-spin" /> : <Sparkles />}
            </Button>
          </div>
        </div>

        {imageUrl && (
            <div className="flex justify-center">
                <Image src={imageUrl} alt={name} width={150} height={150} className="rounded-lg object-contain border p-2" />
            </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Preço (R$)</Label>
            <Input id="price" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9,.]/g, ''))} className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {storedCategories.expense.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="importance">Grau de Importância</Label>
          <Select value={importance} onValueChange={(value) => setImportance(value as any)}>
            <SelectTrigger id="importance" className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </main>
    </div>
  );
}
