'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader2, Plus, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

// You would define this type based on your Pet entity
type Pet = {
  id: string;
  name: string;
  photoUrl: string;
};

export function PetsSection() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
      if(!user) setLoading(false);
      return;
    }
    setLoading(true);
    const petsQuery = query(collection(firestore, 'pets'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(petsQuery, (snapshot) => {
      const userPets: Pet[] = [];
      snapshot.forEach(doc => {
        userPets.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(userPets);
      setLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: 'pets',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-card/50 dark:bg-black/20 rounded-xl">
        <Cat className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Gerencie seus Pets</h3>
        <p className="mt-2 text-sm">Adicione seu primeiro pet para começar a gerenciar vacinas, consultas e mais.</p>
        <Button asChild className="mt-4">
          <Link href="/casa/pets/new">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Pet
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* This is where PetCard components will be rendered */}
      {pets.map(pet => (
        <div key={pet.id}>{pet.name}</div>
      ))}
       <Button asChild variant="outline" className="h-full">
          <Link href="/casa/pets/new" className="flex flex-col items-center justify-center gap-2">
            <Plus className="h-8 w-8" />
            <span>Adicionar Pet</span>
          </Link>
        </Button>
    </div>
  );
}
