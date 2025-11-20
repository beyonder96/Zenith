"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/dashboard');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

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
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                type="email" placeholder="E-mail" 
                className="w-full bg-white/50 dark:bg-white/5 border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all"
            />
            <Input 
                type="password" placeholder="Senha" 
                className="w-full bg-white/50 dark:bg-white/5 border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-all"
            />
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold py-3 h-auto rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Entrar
            </Button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
            <a href="#" className="text-orange-400 hover:underline" onClick={(e) => e.preventDefault()}>
                Criar agora
            </a>
            <a href="/dashboard" onClick={handleLogin} className="text-orange-400 hover:underline">
                Entrar como Convidado
            </a>
        </div>
      </div>
    </div>
  );
}
