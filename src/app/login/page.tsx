"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useUser } from "@/firebase/auth/use-user";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: error.message || "Não foi possível fazer login com o Google.",
      });
    }
  };

  if (loading || user) {
    return (
       <div className="relative h-screen w-screen overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center p-4">
         <p>Carregando...</p>
       </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.pinimg.com/originals/a1/83/83/a183833f4a38543d3513aa67c130b05b.jpg')" }} data-ai-hint="mountain landscape">
        <div className="absolute inset-0 bg-gray-900/30 dark:bg-black/40 backdrop-blur-md"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight tracking-[0.3em] bg-gradient-to-r from-orange-300 via-rose-400 to-pink-500 bg-clip-text text-transparent animate-shine" style={{ animationName: 'shine', animationDuration: '5s' }}>
            ZENITH
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-white/70 font-light">Identifique-se para acessar.</p>
        </div>
        
        <Button onClick={handleGoogleLogin} className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3 h-auto rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            Entrar com Google
        </Button>
      </div>
    </div>
  );
}
