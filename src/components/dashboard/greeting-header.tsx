"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

const CelestialIcon = ({ type }: { type: 'rising-sun' | 'setting-sun' | 'moon' }) => {
    const typeClasses = {
        'rising-sun': 'rising-sun-icon',
        'setting-sun': 'setting-sun-icon',
        'moon': 'moon-icon',
    };
    return <div className={`celestial-body ${typeClasses[type]}`}></div>;
};

export function GreetingHeader() {
  const [greeting, setGreeting] = useState("Boa noite");
  const [iconType, setIconType] = useState<'rising-sun' | 'setting-sun' | 'moon'>("moon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom Dia");
      setIconType("rising-sun");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa Tarde");
      setIconType("setting-sun");
    } else {
      setGreeting("Boa Noite");
      setIconType("moon");
    }
  }, []);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <CelestialIcon type={iconType} />
        <span className="text-xl font-medium text-white/80">{greeting}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black/40 backdrop-blur-xl border border-white/20 text-white">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="focus:bg-white/10">Editar Foto</DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between items-center focus:bg-white/10">
            <span>Alterar Tema</span>
            <Switch />
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
