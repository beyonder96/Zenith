'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShoppingItem } from './shopping-list';

type ItemDetailsModalProps = {
  item: ShoppingItem;
  onConfirm: (item: ShoppingItem, quantity: number, price: number) => void;
  onCancel: () => void;
};

export function ItemDetailsModal({ item, onConfirm, onCancel }: ItemDetailsModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const numQuantity = parseFloat(quantity) || 0;
    const numPrice = parseFloat(price.replace(',', '.')) || 0;
    setTotal(numQuantity * numPrice);
  }, [quantity, price]);

  const handleConfirmClick = () => {
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price.replace(',', '.'));
    if (!isNaN(numQuantity) && !isNaN(numPrice) && numQuantity > 0 && numPrice >= 0) {
      onConfirm(item, numQuantity, numPrice);
    }
  };

  return (
    <Dialog open={true} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Adicionar detalhes para:</DialogTitle>
          <p className="text-center text-orange-400 font-bold text-xl">{item.name}</p>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="bg-card dark:bg-zinc-800"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço Unitário (R$)</Label>
            <Input
              id="price"
              placeholder="ex: 5,50"
              value={price}
              onChange={e => setPrice(e.target.value.replace(/[^0-9,.]/g, ''))}
              className="bg-card dark:bg-zinc-800"
              inputMode="decimal"
            />
          </div>
        </div>
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Total do Item</p>
            <p className="text-2xl font-bold text-orange-400">
                R$ {total.toFixed(2).replace('.', ',')}
            </p>
        </div>
        <DialogFooter className="!grid !grid-cols-2 gap-2 sm:!justify-center">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmClick} className="bg-orange-500 hover:bg-orange-600 text-white">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
