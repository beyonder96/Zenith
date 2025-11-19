"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Sunrise } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

export function GreetingHeader() {
  const [greeting, setGreeting] = useState("Boa noite");
  const [icon, setIcon] = useState(<Moon className="text-gray-300" />);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom Dia");
      setIcon(<Sunrise className="text-orange-300" />);
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa Tarde");
      setIcon(<Sun className="text-yellow-300" />);
    } else {
      setGreeting("Boa Noite");
      setIcon(<Moon className="text-blue-300" />);
    }
  }, []);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-2xl font-medium">{greeting}</span>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-black/50 backdrop-blur-lg border-white/10">
          <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem>Editar Foto</DropdownMenuItem>
          <DropdownMenuItem className="flex justify-between items-center">
            <span>Alterar Tema</span>
            <Switch />
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="text-red-500 focus:bg-red-500/20 focus:text-red-400">
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
