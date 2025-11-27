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
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type StatementOptionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type PeriodOption = '3d' | '7d' | '2w' | '1m' | 'custom';

export function StatementOptionsDialog({ open, onOpenChange }: StatementOptionsDialogProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [statementType, setStatementType] = useState<'detailed' | 'summary'>('detailed');
  const [periodOption, setPeriodOption] = useState<PeriodOption>('7d');

  const handleGenerateStatement = () => {
    let finalStartDate: Date | undefined = startDate;
    let finalEndDate: Date | undefined = endDate;

    if (periodOption !== 'custom') {
        const today = new Date();
        finalEndDate = today;
        switch (periodOption) {
            case '3d':
                finalStartDate = subDays(today, 2);
                break;
            case '7d':
                finalStartDate = subDays(today, 6);
                break;
            case '2w':
                finalStartDate = subDays(today, 13);
                break;
            case '1m':
                finalStartDate = subDays(today, 29);
                break;
        }
    }


    if (!finalStartDate || !finalEndDate) {
      toast({
        variant: 'destructive',
        title: 'Período incompleto',
        description: 'Por favor, selecione as datas de início e fim.',
      });
      return;
    }

    if (finalEndDate < finalStartDate) {
        toast({
            variant: 'destructive',
            title: 'Período inválido',
            description: 'A data final não pode ser anterior à data inicial.',
        });
        return;
    }
    
    const query = new URLSearchParams({
      start: format(finalStartDate, 'yyyy-MM-dd'),
      end: format(finalEndDate, 'yyyy-MM-dd'),
      type: statementType,
      period: periodOption
    });
    
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
            <div className="space-y-3">
                <Label>Período</Label>
                <RadioGroup value={periodOption} onValueChange={(value: PeriodOption) => setPeriodOption(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3d" id="p-3d" />
                        <Label htmlFor="p-3d" className="font-normal">Últimos 3 dias</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="7d" id="p-7d" />
                        <Label htmlFor="p-7d" className="font-normal">Últimos 7 dias</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2w" id="p-2w" />
                        <Label htmlFor="p-2w" className="font-normal">Últimas 2 semanas</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1m" id="p-1m" />
                        <Label htmlFor="p-1m" className="font-normal">Último mês</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="p-custom" />
                        <Label htmlFor="p-custom" className="font-normal">Período personalizado</Label>
                    </div>
                </RadioGroup>
            </div>
            
            {periodOption === 'custom' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
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
            )}

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
