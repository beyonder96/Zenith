'use client';

import { useEffect, useState }from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Cat, Calendar, Tag, ShieldCheck, PawPrint, FileText, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Vaccine = {
    name: string;
    date: string;
};

type Pet = {
    id: string;
    name: string;
    breed: string;
    birthDate: string;
    photoUrl: string;
    gender: 'Macho' | 'Fêmea';
    isNeutered: boolean;
    vaccines: Vaccine[];
    microchipNumber: string;
    rgaUrl: string;
    userId: string;
};

const PetDetailSkeleton = () => (
    <div className="p-6 space-y-6">
        <div className="flex justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-5 w-1/3 mx-auto" />
        <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

export default function PetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const petId = params.petId as string;
    const [pet, setPet] = useState<Pet | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!firestore || !user || !petId) return;

        const docRef = doc(firestore, 'pets', petId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                setPet({ id: docSnap.id, ...docSnap.data() } as Pet);
            } else {
                setPet(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching pet details:", error);
            const permissionError = new FirestorePermissionError({
                path: `pets/${petId}`,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, user, petId]);
    
    const handleDelete = () => {
        if (!firestore || !petId) return;
        deleteDoc(doc(firestore, 'pets', petId))
            .then(() => {
                toast({ title: "Pet removido", description: `${pet?.name} foi removido com sucesso.`});
                router.back();
            })
            .catch(error => {
                 const permissionError = new FirestorePermissionError({
                    path: `pets/${petId}`,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            })
    };
    
    if (loading) {
        return (
            <div className="bg-background min-h-screen">
                 <header className="flex items-center justify-between p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                     <Skeleton className="h-6 w-24" />
                    <div className="w-10"></div>
                 </header>
                 <PetDetailSkeleton />
            </div>
        );
    }
    
    if (!pet) {
        return <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <Cat className="h-16 w-16 text-muted-foreground mb-4"/>
            <h2 className="text-xl font-semibold">Pet não encontrado</h2>
            <p className="text-muted-foreground">O pet que você está procurando não existe ou você não tem permissão para vê-lo.</p>
            <Button onClick={() => router.back()} className="mt-4">Voltar</Button>
        </div>
    }

    const age = differenceInYears(new Date(), parseISO(pet.birthDate));

    return (
        <>
        <div className="bg-background min-h-screen text-foreground">
            <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                </Button>
                <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={() => router.push(`/casa/pets/new?id=${petId}`)}>
                        <Edit />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 />
                    </Button>
                </div>
            </header>

            <main className="p-6 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative h-32 w-32 rounded-full border-4 border-background shadow-md bg-secondary flex items-center justify-center">
                        {pet.photoUrl ? (
                            <Image src={pet.photoUrl} alt={pet.name} layout="fill" className="rounded-full object-cover" />
                        ) : (
                            <Cat className="w-16 h-16 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-center">{pet.name}</h1>
                        <p className="text-muted-foreground text-center">{pet.breed || 'Raça não informada'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-card p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground">Idade</p>
                        <p className="text-lg font-semibold">{age} anos</p>
                    </div>
                     <div className="bg-card p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground">Gênero</p>
                        <p className="text-lg font-semibold">{pet.gender || 'Não informado'}</p>
                    </div>
                </div>

                <div className="space-y-4">
                     <Card className="bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <PawPrint className="text-primary"/>
                                <p>Castrado?</p>
                            </div>
                            <Badge variant={pet.isNeutered ? 'default' : 'secondary'} className={cn(pet.isNeutered && 'bg-green-500')}>{pet.isNeutered ? 'Sim' : 'Não'}</Badge>
                        </CardContent>
                    </Card>
                     {pet.microchipNumber && (
                        <Card className="bg-card">
                             <CardContent className="p-4 flex items-center gap-4">
                                <Tag className="text-primary"/>
                                <div>
                                    <p className="text-sm text-muted-foreground">Nº do Microchip</p>
                                    <p>{pet.microchipNumber}</p>
                                </div>
                            </CardContent>
                        </Card>
                     )}
                     {pet.rgaUrl && (
                        <Card className="bg-card">
                            <CardContent className="p-4">
                                <Link href={pet.rgaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <FileText className="text-primary"/>
                                        <p>Documento RGA</p>
                                    </div>
                                    <Button variant="link" className="text-primary">Ver</Button>
                                </Link>
                            </CardContent>
                        </Card>
                     )}
                </div>

                 <div className="mt-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck/> Vacinas</h2>
                    <div className="space-y-3">
                        {pet.vaccines && pet.vaccines.length > 0 ? pet.vaccines.map((vaccine, index) => (
                           <Card key={index} className="bg-card">
                               <CardContent className="p-4 flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                        <BadgeCheck className="text-cyan-500" />
                                        <p className="font-semibold">{vaccine.name}</p>
                                   </div>
                                    <p className="text-sm text-muted-foreground">{format(parseISO(vaccine.date), 'dd/MM/yyyy')}</p>
                                </CardContent>
                           </Card>
                        )) : (
                            <p className="text-center text-muted-foreground py-4">Nenhuma vacina registrada.</p>
                        )}
                    </div>
                 </div>

            </main>
        </div>
         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente o perfil de {pet.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
    