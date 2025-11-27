'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, ArrowUp, Pencil } from "lucide-react";
import type { Goal } from "./types";
import { cn } from "@/lib/utils";

type GoalCardProps = {
    goal: Goal;
    onDeposit: () => void;
    onWithdraw: () => void;
    onEdit: () => void;
};

export function GoalCard({ goal, onDeposit, onWithdraw, onEdit }: GoalCardProps) {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const deadline = parseISO(goal.deadline);
    const daysRemaining = differenceInDays(deadline, new Date());

    const getDaysRemainingText = () => {
        if (daysRemaining < 0) return "Prazo encerrado";
        if (daysRemaining === 0) return "Hoje é o último dia!";
        if (daysRemaining === 1) return "Falta 1 dia";
        return `Faltam ${daysRemaining} dias`;
    };

    return (
        <Card className="w-full bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {format(deadline, "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                        <Pencil size={16}/>
                    </Button>
                </div>
                
                <div className="mt-4">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-cyan-400 font-semibold">
                            {goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                           Meta: {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between items-end mt-1">
                        <span className="text-xs text-muted-foreground">{Math.floor(progress)}%</span>
                        <span className={cn(
                            "text-xs font-semibold",
                            daysRemaining < 7 && daysRemaining >= 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                            {getDaysRemainingText()}
                        </span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={onDeposit} className="bg-transparent">
                        <ArrowUp className="mr-2 h-4 w-4 text-cyan-500"/> Depositar
                    </Button>
                    <Button variant="outline" onClick={onWithdraw} className="bg-transparent">
                        <ArrowDown className="mr-2 h-4 w-4 text-pink-500"/> Resgatar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
