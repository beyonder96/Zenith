'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Cat } from 'lucide-react';
import { cn } from '@/lib/utils';

type Pet = {
  id: string;
  name: string;
  photoUrl: string;
};

type PetCardProps = {
  pet: Pet;
};

export function PetCard({ pet }: PetCardProps) {
  return (
    <Link href={`/casa/pets/${pet.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 bg-card/80 dark:bg-black/20 border-border dark:border-white/10 backdrop-blur-sm">
        <div className="aspect-square relative w-full">
          {pet.photoUrl ? (
            <Image
              src={pet.photoUrl}
              alt={pet.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <Cat className="w-1/2 h-1/2 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <p className="font-bold text-center truncate text-foreground">{pet.name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
