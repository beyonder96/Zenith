'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Note } from "./notes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type NoteCardProps = {
    note: Note;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const date = parseISO(note.createdAt);
  const formattedDate = format(date, "dd MMM yyyy", { locale: ptBR });

  return (
    <div className="relative group w-full h-full p-[1.5px] rounded-2xl overflow-hidden shadow-lg mb-4 break-inside-avoid">
        <div className="animated-border w-full h-full" />
        <Card className={cn("w-full h-full rounded-[22px] border-none backdrop-blur-lg", note.color || 'bg-card/30 dark:bg-black/30')}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg font-bold text-foreground/90">{note.title}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-full text-foreground/60 hover:bg-foreground/10">
                            <MoreVertical size={18} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEdit(note.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-red-500 focus:text-red-500">
                             <Trash2 className="mr-2 h-4 w-4" />
                             <span>Deletar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.content}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                    ))}
                </div>
                <p className="text-xs text-foreground/50 mt-4 text-right">{formattedDate}</p>
            </CardContent>
        </Card>
    </div>
  );
}
