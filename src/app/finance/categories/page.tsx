'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

type CategoryType = 'expense' | 'income';

const defaultCategories = {
  expense: ['Contas', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Compras', 'Outros'],
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
};

export default function CategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useLocalStorage('user-categories', defaultCategories);
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [editingCategory, setEditingCategory] = useState<{ type: CategoryType; oldName: string; newName: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ type: CategoryType; name: string } | null>(null);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const lowerCaseCategories = categories[activeTab].map(c => c.toLowerCase());
      if (lowerCaseCategories.includes(newCategoryName.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Categoria já existe",
            description: "Essa categoria já foi adicionada."
        })
        return;
      }

      setCategories({
        ...categories,
        [activeTab]: [...categories[activeTab], newCategoryName.trim()],
      });
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (type: CategoryType, name: string) => {
    setEditingCategory({ type, oldName: name, newName: name });
  };

  const handleConfirmEdit = () => {
    if (editingCategory && editingCategory.newName.trim()) {
      const { type, oldName, newName } = editingCategory;
      const updatedCategories = categories[type].map(c => (c === oldName ? newName.trim() : c));
      setCategories({
        ...categories,
        [type]: updatedCategories,
      });
      setEditingCategory(null);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      const { type, name } = deletingCategory;
      setCategories({
        ...categories,
        [type]: categories[type].filter(c => c !== name),
      });
      setDeletingCategory(null);
    }
  };

  const renderCategoryList = (type: CategoryType) => {
    return (
      <div className="space-y-3">
        {categories[type].map(category => (
          editingCategory?.oldName === category && editingCategory.type === type ? (
            <div key={category} className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <Input
                value={editingCategory.newName}
                onChange={e => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                className="bg-zinc-700 border-zinc-600 h-8"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleConfirmEdit()}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingCategory(null)}><X size={16} /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleConfirmEdit}><Check size={16} /></Button>
            </div>
          ) : (
            <div key={category} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg group">
              <span className="font-medium">{category}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleStartEdit(type, category)}>
                  <Edit size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setDeletingCategory({ type, name: category })}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          )
        ))}
        {isAdding && activeTab === type && (
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                <Input 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="bg-zinc-700 border-zinc-600 h-8"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsAdding(false)}><X size={16} /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleAddCategory}><Check size={16} /></Button>
            </div>
        )}
      </div>
    );
  };

  return (
    <>
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">Gerenciar Categorias</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)}>
            <Plus />
        </Button>
      </header>

      <main className="p-6">
        <div className="flex w-full items-center justify-center gap-2 mb-6">
            <Button
                onClick={() => setActiveTab('expense')}
                variant={activeTab === 'expense' ? 'destructive' : 'outline'}
                className={cn('flex-1 rounded-full', activeTab !== 'expense' && 'bg-zinc-800 border-zinc-700')}
            >
                Despesas
            </Button>
            <Button
                onClick={() => setActiveTab('income')}
                variant={activeTab === 'income' ? 'default' : 'outline'}
                className={cn('flex-1 rounded-full', activeTab !== 'income' && 'bg-zinc-800 border-zinc-700', activeTab === 'income' && 'bg-cyan-500 hover:bg-cyan-600')}
            >
                Receitas
            </Button>
        </div>

        {activeTab === 'expense' ? renderCategoryList('expense') : renderCategoryList('income')}
      </main>
    </div>

    <AlertDialog open={deletingCategory !== null} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso irá deletar permanentemente a categoria "{deletingCategory?.name}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
