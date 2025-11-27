'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Goal } from './types';

type GoalTransactionDialogProps = {
  goal: Goal;
  type: 'deposit' | 'withdraw';
  onClose: () => void;
  onConfirm: (goal: Goal, amount: number, type: 'deposit' | 'withdraw') => void;
};

export function GoalTransactionDialog({ goal, type, onClose, onConfirm }: GoalTransactionDialogProps) {
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor inválido',
        description: 'Por favor, insira um valor positivo.',
      });
      return;
    }
    onConfirm(goal, numericAmount, type);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">{type === 'deposit' ? 'Depositar' : 'Resgatar'}</DialogTitle>
          <DialogDescription>
            {type === 'deposit' ? 'Quanto você quer adicionar à meta' : 'Quanto você quer retirar da meta'} "{goal.name}"?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
              placeholder="50,00"
              className="text-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>{type === 'deposit' ? 'Depositar' : 'Resgatar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
