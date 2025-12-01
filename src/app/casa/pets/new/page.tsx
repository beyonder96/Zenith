'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ArrowLeft, Image as ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
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

export default function NewPetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const storage = getStorage();
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const rgaFileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>();
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [gender, setGender] = useState<'Macho' | 'Fêmea' | null>(null);
  const [isNeutered, setIsNeutered] = useState(false);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [rgaFile, setRgaFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, fileType: 'photo' | 'rga') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if(fileType === 'photo') {
        setPhotoFile(file);
        setPhotoUrl(URL.createObjectURL(file));
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
    if (!name.trim() || !birthDate || (!photoUrl && !photoFile)) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome, data de nascimento e foto são obrigatórios.",
      });
      return;
    }
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Usuário não autenticado.' });
        return;
    }
    
    setIsUploading(true);
    
    try {
        const uploadPromises: Promise<[string, string] | void>[] = [];

        if (photoFile) {
            const photoPath = `pets/${user.uid}/photos/${uuidv4()}-${photoFile.name}`;
            const photoStorageRef = ref(storage, photoPath);
            uploadPromises.push(
                uploadBytes(photoStorageRef, photoFile).then(snapshot => 
                    getDownloadURL(snapshot.ref).then(url => ['photo', url])
                )
            );
        }

        if (rgaFile) {
            const rgaPath = `pets/${user.uid}/rga/${uuidv4()}-${rgaFile.name}`;
            const rgaStorageRef = ref(storage, rgaPath);
            uploadPromises.push(
                uploadBytes(rgaStorageRef, rgaFile).then(snapshot => 
                    getDownloadURL(snapshot.ref).then(url => ['rga', url])
                )
            );
        }

        const uploadResults = await Promise.all(uploadPromises);

        let finalPhotoUrl = photoUrl;
        let finalRgaUrl = '';

        uploadResults.forEach(result => {
            if(result) {
                const [type, url] = result;
                if(type === 'photo') finalPhotoUrl = url;
                if(type === 'rga') finalRgaUrl = url;
            }
        });

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
        
        await addDoc(collection(firestore, 'pets'), petData);
        
        toast({ title: "Pet adicionado!" });
        router.push('/projects');

    } catch (error: any) {
        console.error("Save/Upload error:", error);
        if (error.code?.includes('permission-denied')) {
             const permissionError = new FirestorePermissionError({
                path: 'pets',
                operation: 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao Salvar', description: 'Não foi possível salvar os dados do pet.'});
        }
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">Novo Pet</h1>
        <Button variant="link" onClick={handleSave} disabled={isUploading} className="font-bold text-orange-500">
          {isUploading ? 'Salvando...' : 'Salvar'}
        </Button>
      </header>

      <main className="p-6 space-y-8">
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
                {rgaFile ? rgaFile.name : 'Anexar documento'}
            </Button>
        </div>


         <div className="space-y-4">
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
