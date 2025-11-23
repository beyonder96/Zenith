"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase/auth/use-user";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // User has successfully signed in.
            router.push('/dashboard');
          } else {
            // This is the initial page load, not a redirect.
            // Or the user is already logged in from a previous session.
            if (!userLoading && user) {
              router.push('/dashboard');
            } else {
              setIsAuthenticating(false);
            }
          }
        })
        .catch((error) => {
          console.error("Redirect result error:", error);
          toast({
            variant: "destructive",
            title: "Erro de Autenticação",
            description: "Não foi possível completar o login após o redirecionamento.",
          });
          setIsAuthenticating(false);
        });
    } else {
        if (!userLoading) {
            setIsAuthenticating(false);
        }
    }
  }, [auth, router, toast, user, userLoading]);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The user will be redirected, and the result will be handled by the useEffect.
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: error.message || "Não foi possível iniciar o login com o Google.",
      });
      setIsAuthenticating(false);
    }
  };

  if (userLoading || isAuthenticating) {
    return (
       <div className="relative h-screen w-screen overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center p-4">
         <Loader2 className="h-8 w-8 animate-spin" />
         <p className="ml-2">Carregando...</p>
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
