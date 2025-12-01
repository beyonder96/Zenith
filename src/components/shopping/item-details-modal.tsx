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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ItemDetailsModalProps = {
  item: ShoppingItem;
  onConfirm: (item: ShoppingItem, quantity: number, price: number) => void;
  onCancel: () => void;
};

export function ItemDetailsModal({ item, onConfirm, onCancel }: ItemDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('unit');
  
  // State for Unit tab
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitTotal, setUnitTotal] = useState(0);
  
  // State for Weight tab
  const [pricePerKg, setPricePerKg] = useState('');
  const [weightInGrams, setWeightInGrams] = useState('');
  const [weightTotal, setWeightTotal] = useState(0);

  useEffect(() => {
    const numQuantity = parseFloat(quantity) || 0;
    const numPrice = parseFloat(unitPrice.replace(',', '.')) || 0;
    setUnitTotal(numQuantity * numPrice);
  }, [quantity, unitPrice]);

  useEffect(() => {
    const numPricePerKg = parseFloat(pricePerKg.replace(',', '.')) || 0;
    const numWeightGrams = parseFloat(weightInGrams) || 0;
    setWeightTotal((numPricePerKg / 1000) * numWeightGrams);
  }, [pricePerKg, weightInGrams]);

  const handleConfirmClick = () => {
    if (activeTab === 'unit') {
      const numQuantity = parseFloat(quantity);
      const numPrice = parseFloat(unitPrice.replace(',', '.'));
      if (!isNaN(numQuantity) && !isNaN(numPrice) && numQuantity > 0 && numPrice >= 0) {
        onConfirm(item, numQuantity, numPrice);
      }
    } else { // activeTab is 'weight'
      const numPricePerKg = parseFloat(pricePerKg.replace(',', '.'));
      const numWeightGrams = parseFloat(weightInGrams);
      if (!isNaN(numPricePerKg) && !isNaN(numWeightGrams) && numPricePerKg > 0 && numWeightGrams > 0) {
        // We save quantity as KG, and price as the total calculated price
        const finalQuantity = numWeightGrams / 1000;
        const finalPrice = (numPricePerKg / 1000) * numWeightGrams;
        onConfirm(item, finalQuantity, finalPrice / finalQuantity);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Adicionar detalhes para:</DialogTitle>
          <p className="text-center text-orange-400 font-bold text-xl">{item.name}</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unit">Por Unidade</TabsTrigger>
            <TabsTrigger value="weight">Por Peso</TabsTrigger>
          </TabsList>
          <TabsContent value="unit">
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
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value.replace(/[^0-9,.]/g, ''))}
                  className="bg-card dark:bg-zinc-800"
                  inputMode="decimal"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total do Item</p>
              <p className="text-2xl font-bold text-orange-400">
                  R$ {unitTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="weight">
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Preço por KG (R$)</Label>
                <Input
                  id="pricePerKg"
                  placeholder="ex: 6,00"
                  value={pricePerKg}
                  onChange={e => setPricePerKg(e.target.value.replace(/[^0-9,.]/g, ''))}
                  className="bg-card dark:bg-zinc-800"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weightInGrams">Peso (em gramas)</Label>
                <Input
                  id="weightInGrams"
                  type="number"
                  placeholder="ex: 600"
                  value={weightInGrams}
                  onChange={e => setWeightInGrams(e.target.value)}
                  className="bg-card dark:bg-zinc-800"
                />
              </div>
            </div>
             <div className="text-center">
                <p className="text-sm text-muted-foreground">Total do Item</p>
                <p className="text-2xl font-bold text-orange-400">
                    R$ {weightTotal.toFixed(2).replace('.', ',')}
                </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="!grid !grid-cols-2 gap-2 sm:!justify-center mt-4">
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
