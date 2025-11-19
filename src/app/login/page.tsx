"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://picsum.photos/seed/mountain/1920/1080')" }}
        data-ai-hint="mountain landscape"
      ></div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xl"></div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-8 text-center shadow-2xl backdrop-blur-xl">
            <h1
              className="mb-8 bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 bg-clip-text text-6xl font-thin tracking-[0.3em] text-transparent animate-shine bg-[200%_auto]"
              style={{ animationDuration: '3s' }}
            >
              ZENITH
            </h1>

            <form className="space-y-6 text-left">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input type="email" id="email" placeholder="seu@email.com" className="bg-white/5 border-white/20 focus-visible:ring-orange-500 focus-visible:ring-offset-0" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input type="password" id="password" placeholder="••••••••" className="bg-white/5 border-white/20 focus-visible:ring-orange-500 focus-visible:ring-offset-0" />
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transition-transform hover:scale-105 active:scale-100"
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 flex justify-between text-sm">
              <Link href="#" className="text-orange-400 hover:underline">
                Criar agora
              </Link>
              <a href="/dashboard" onClick={handleLogin} className="text-orange-400 hover:underline">
                Entrar como Convidado
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
