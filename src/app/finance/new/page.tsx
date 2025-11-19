'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
};

type TransactionType = 'expense' | 'income';

const categories = {
  expense: ['Contas', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Compras', 'Outros'],
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
};

export default function NewTransactionPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('zenith-vision-finance', []);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleSave = () => {
    if (!description.trim() || !amount.trim() || !date) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Descrição, valor e data são necessários.',
      });
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount)) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Por favor, insira um número válido para o valor.',
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount: type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount),
      date: format(date, 'yyyy-MM-dd'),
      type,
      category: category || categories[type][0],
    };

    setTransactions([...transactions, newTransaction]);
    setShowSuccessAnimation(true);

    setTimeout(() => {
        router.push('/finance');
        setTimeout(() => setShowSuccessAnimation(false), 500);
    }, 1500);
  };

  if (showSuccessAnimation) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center animate-fade-in">
        <div className="success-checkmark__container">
          <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="link" onClick={() => router.back()} className="text-orange-500">
          Cancelar
        </Button>
        <h1 className="font-bold text-lg">Nova Transação</h1>
        <Button variant="link" onClick={handleSave} className="font-bold text-orange-500">
          Salvar
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Ex: Aluguel"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-zinc-800 border-zinc-700 rounded-md"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="text"
              placeholder="25,50"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
              className="bg-zinc-800 border-zinc-700 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700 rounded-md hover:bg-zinc-700 hover:text-white',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <div className="flex gap-2">
            <Button
              variant={type === 'expense' ? 'destructive' : 'outline'}
              onClick={() => { setType('expense'); setCategory(''); }}
              className={cn(
                'flex-1',
                type === 'expense' ? 'bg-destructive/80 text-white border-destructive' : 'bg-zinc-800 border-zinc-700'
              )}
            >
              Despesa
            </Button>
            <Button
               variant={type === 'income' ? 'default' : 'outline'}
               onClick={() => { setType('income'); setCategory(''); }}
               className={cn(
                 'flex-1',
                 type === 'income' ? 'bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600' : 'bg-zinc-800 border-zinc-700'
               )}
            >
              Receita
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="bg-zinc-800 border-zinc-700 rounded-md">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories[type].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-md">
          <Label htmlFor="recurrent-task" className="m-0">Transação Recorrente</Label>
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
