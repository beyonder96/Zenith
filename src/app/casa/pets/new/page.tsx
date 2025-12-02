'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { v4 as uuidv4 } from 'uuid';

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

const uploadFile = async (storage: any, user: any, file: File, folder: 'photos' | 'rga'): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado para upload.");
    const filePath = `pets/${user.uid}/${folder}/${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};


export default function NewPetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const storage = getStorage();
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const rgaFileInputRef = useRef<HTMLInputElement>(null);
  
  const [petId, setPetId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  
  const [photoUrl, setPhotoUrl] = useState(''); // Holds URL for preview or existing URL
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [gender, setGender] = useState<'Macho' | 'Fêmea' | null>(null);
  const [isNeutered, setIsNeutered] = useState(false);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [microchipNumber, setMicrochipNumber] = useState('');
  
  const [rgaFile, setRgaFile] = useState<File | null>(null);
  const [existingRgaUrl, setExistingRgaUrl] = useState(''); // Holds existing URL
  
  const isEditing = petId !== null;

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && user && firestore) {
      setPetId(id);
      const fetchPet = async () => {
        const docRef = doc(firestore, 'pets', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
            const petToEdit = docSnap.data() as Omit<Pet, 'id'>;
            setName(petToEdit.name);
            setBreed(petToEdit.breed || '');
            if(petToEdit.birthDate) setBirthDate(parseISO(petToEdit.birthDate));
            setPhotoUrl(petToEdit.photoUrl);
            setGender(petToEdit.gender || null);
            setIsNeutered(petToEdit.isNeutered || false);
            setVaccines(petToEdit.vaccines || []);
            setMicrochipNumber(petToEdit.microchipNumber || '');
            setExistingRgaUrl(petToEdit.rgaUrl || '');
        } else {
             toast({ variant: 'destructive', title: 'Erro', description: 'Pet não encontrado ou você não tem permissão para editá-lo.' });
             router.push('/projects');
        }
      };
      fetchPet();
    }
  }, [searchParams, user, firestore, router, toast]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'rga') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if(fileType === 'photo') {
        setPhotoFile(file);
        setPhotoUrl(URL.createObjectURL(file)); // Update preview URL
      } else {
        setRgaFile(file);
      }
    }
  };

  const handleUpdateVaccine = (index: number, field: keyof Vaccine, value: string) => {
    const newVaccines = [...vaccines];
    newVaccines[index][field] = value;
    setVaccines(newVaccines);
  };

  const handleAddVaccine = () => {
    setVaccines([...vaccines, { name: '', date: '' }]);
  };
  
  const handleRemoveVaccine = (index: number) => {
    setVaccines(vaccines.filter((_, i) => i !== index));
  };
  
  const handleSave = async () => {
    if (!name.trim() || !birthDate) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Nome e data de nascimento são obrigatórios." });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário não autenticado.' });
        return;
    }
    
    setIsSaving(true);
    
    try {
        let finalPhotoUrl = photoUrl;
        let finalRgaUrl = existingRgaUrl;

        // --- UPLOAD PHASE ---
        const uploadPromises: Promise<void>[] = [];
        if (photoFile) {
            uploadPromises.push(
                uploadFile(storage, user, photoFile, 'photos').then(url => {
                    finalPhotoUrl = url;
                })
            );
        }
        if (rgaFile) {
            uploadPromises.push(
                uploadFile(storage, user, rgaFile, 'rga').then(url => {
                    finalRgaUrl = url;
                })
            );
        }

        await Promise.all(uploadPromises);

        // --- DATABASE WRITE PHASE ---
        const petData = {
            name,
            breed,
            birthDate: format(birthDate, 'yyyy-MM-dd'),
            photoUrl: finalPhotoUrl,
            gender,
            isNeutered,
            vaccines,
            microchipNumber,
            rgaUrl: finalRgaUrl,
            userId: user.uid,
        };

        if (isEditing && petId) {
            await updateDoc(doc(firestore, 'pets', petId), petData);
            toast({ title: "Pet atualizado!", description: "As informações foram salvas com sucesso." });
            router.push(`/casa/pets/${petId}`);
        } else {
            const docRef = await addDoc(collection(firestore, 'pets'), petData);
            toast({ title: "Pet adicionado!", description: "Seu novo pet foi salvo." });
            router.push(`/casa/pets/${docRef.id}`);
        }

    } catch (error: any) {
        console.error("Save error:", error);
        const operation = isEditing ? 'update' : 'create';
        const path = isEditing ? `pets/${petId}` : 'pets';
        if (error.code?.includes('permission-denied') || error.message.includes('permission-denied')) {
             const permissionError = new FirestorePermissionError({ path, operation });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: `Não foi possível salvar os dados do pet. Detalhe: ${error.message}`});
        }
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="bg-background h-screen text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">{isEditing ? 'Editar Pet' : 'Novo Pet'}</h1>
        <Button variant="link" onClick={handleSave} disabled={isSaving} className="font-bold text-orange-500">
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </header>

      <main className="p-6 space-y-8 flex-grow overflow-y-auto">
         <div className="flex justify-center">
            <input 
                type="file" 
                ref={photoFileInputRef}
                onChange={(e) => handleFileChange(e, 'photo')}
                accept="image/*"
                className="hidden"
            />
             <Button
                variant="ghost"
                className="relative h-32 w-32 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center"
                onClick={() => photoFileInputRef.current?.click()}
             >
                {photoUrl ? (
                    <Image src={photoUrl} alt="Pré-visualização" layout="fill" className="rounded-full object-cover" />
                ) : (
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
             </Button>
         </div>

        <div className="space-y-2">
            <Label htmlFor="name">Nome do Pet</Label>
            <Input
                id="name"
                placeholder="Ex: Bob"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 h-12 text-lg"
            />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="breed">Raça (opcional)</Label>
                <Input
                id="breed"
                placeholder="Ex: Vira-lata"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
                />
            </div>
            <div className="space-y-2">
                <Label>Nascimento</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md',
                        !birthDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, 'dd/MM/yyyy') : <span>Selecione</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={birthDate}
                        onSelect={setBirthDate}
                        captionLayout="dropdown-buttons"
                        fromYear={2000}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
                <Label>Gênero</Label>
                 <div className="flex gap-2">
                    <Button
                      variant={gender === 'Macho' ? 'default' : 'outline'}
                      onClick={() => setGender('Macho')}
                      className={cn('flex-1', gender === 'Macho' && 'bg-blue-500 hover:bg-blue-600')}
                    >
                      Macho
                    </Button>
                    <Button
                      variant={gender === 'Fêmea' ? 'default' : 'outline'}
                       onClick={() => setGender('Fêmea')}
                      className={cn('flex-1', gender === 'Fêmea' && 'bg-pink-500 hover:bg-pink-600')}
                    >
                      Fêmea
                    </Button>
                  </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-card rounded-lg h-full mt-2">
                <Label htmlFor="neutered" className="text-base">Castrado?</Label>
                <Switch id="neutered" checked={isNeutered} onCheckedChange={setIsNeutered} />
            </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="microchip">Nº do Microchip (opcional)</Label>
            <Input
                id="microchip"
                placeholder="000.000.000"
                value={microchipNumber}
                onChange={(e) => setMicrochipNumber(e.target.value)}
                className="bg-card dark:bg-zinc-800 border-border dark:border-zinc-700 rounded-md"
            />
        </div>

        <div className="space-y-3">
             <Label>RGA do animal (opcional)</Label>
            <input 
                type="file" 
                ref={rgaFileInputRef}
                onChange={(e) => handleFileChange(e, 'rga')}
                accept=".pdf,image/*"
                className="hidden"
            />
            <Button
                variant="outline"
                className="w-full justify-start font-normal"
                onClick={() => rgaFileInputRef.current?.click()}
            >
                <Upload className="mr-2 h-4 w-4"/>
                {rgaFile ? rgaFile.name : (existingRgaUrl ? 'Substituir documento' : 'Anexar documento')}
            </Button>
             {existingRgaUrl && !rgaFile && <p className='text-xs text-muted-foreground'>Documento atual: <a href={existingRgaUrl} target='_blank' rel='noopener noreferrer' className='text-primary underline'>Visualizar</a></p>}
        </div>


         <div className="space-y-4 pb-8">
            <Label className="text-base font-semibold">Carteira de Vacinação</Label>
            <div className="space-y-3">
                {vaccines.map((vaccine, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-card rounded-lg">
                        <Input 
                            placeholder="Nome da Vacina"
                            value={vaccine.name}
                            onChange={e => handleUpdateVaccine(index, 'name', e.target.value)}
                            className="bg-background"
                        />
                        <Input 
                            type="date"
                            value={vaccine.date}
                            onChange={e => handleUpdateVaccine(index, 'date', e.target.value)}
                            className="bg-background"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveVaccine(index)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button variant="outline" onClick={handleAddVaccine} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Vacina
            </Button>
        </div>

      </main>
    </div>
  );
}

    