'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type StatementOptionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StatementOptionsDialog({ open, onOpenChange }: StatementOptionsDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statementType, setStatementType] = useState<'detailed' | 'summary'>('detailed');

  const handleGenerateStatement = () => {
    if (!startDate || !endDate) {
      toast({
        variant: 'destructive',
        title: 'Período incompleto',
        description: 'Por favor, selecione as datas de início e fim.',
      });
      return;
    }

    if (endDate < startDate) {
        toast({
            variant: 'destructive',
            title: 'Período inválido',
            description: 'A data final não pode ser anterior à data inicial.',
        });
        return;
    }
    
    const query = new URLSearchParams({
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
      type: statementType,
    });
    
    // Abre em uma nova aba
    window.open(`/finance/statement?${query.toString()}`, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Extrato Financeiro</DialogTitle>
          <DialogDescription>
            Selecione o período e o tipo de extrato que você deseja visualizar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
                <Label>Data de Início</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !startDate && 'text-muted-foreground'
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yy') : <span>Início</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR}/>
                    </PopoverContent>
                </Popover>
            </div>
             <div className="flex flex-col gap-2">
                <Label>Data Final</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'w-full justify-start text-left font-normal',
                            !endDate && 'text-muted-foreground'
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yy') : <span>Fim</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={ptBR}/>
                    </PopoverContent>
                </Popover>
            </div>
          </div>
          <div className="space-y-3">
             <Label>Tipo de Extrato</Label>
              <RadioGroup defaultValue="detailed" value={statementType} onValueChange={(value: 'detailed' | 'summary') => setStatementType(value)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="r-detailed" />
                    <Label htmlFor="r-detailed" className="font-normal">Detalhado</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="summary" id="r-summary" />
                    <Label htmlFor="r-summary" className="font-normal">Resumido</Label>
                </div>
             </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateStatement} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Gerar Extrato</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
