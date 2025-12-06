
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Note } from "@/app/projects/types";
import { Badge } from "@/components/ui/badge";

type NoteCardProps = {
    note: Note;
    onView: (note: Note) => void;
};

export function NoteCard({ note, onView }: NoteCardProps) {
  let date: Date;

  // Firestore Timestamps can be objects, so we need to handle them.
  if (typeof note.createdAt === 'string') {
    date = parseISO(note.createdAt);
  } else if (note.createdAt && typeof note.createdAt === 'object' && 'toDate' in note.createdAt) {
    // This handles the Firebase Timestamp object
    date = (note.createdAt as any).toDate();
  } else {
    // Fallback if the date is invalid or another type, though it shouldn't happen with valid data
    date = new Date();
  }

  const formattedDate = format(date, "dd MMM yyyy", { locale: ptBR });

  return (
    <button onClick={() => onView(note)} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
      <div className="relative group w-full h-full p-[1.5px] rounded-2xl overflow-hidden shadow-lg mb-4 break-inside-avoid">
          <div className="animated-border w-full h-full" />
          <Card className={cn("w-full h-full rounded-[22px] border-none backdrop-blur-lg", note.color || 'bg-card/30 dark:bg-black/30')}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <CardTitle className="text-lg font-bold text-foreground/90 truncate">{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-5">{note.content}</p>
                  <div className="flex flex-wrap gap-1 mt-4">
                      {note.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                      ))}
                      {note.tags && note.tags.length > 2 && (
                          <Badge variant="outline">+{note.tags.length - 2}</Badge>
                      )}
                  </div>
                  <p className="text-xs text-foreground/50 mt-4 text-right">{formattedDate}</p>
              </CardContent>
          </Card>
      </div>
    </button>
  );
}
