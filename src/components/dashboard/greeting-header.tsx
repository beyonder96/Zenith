"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export function GreetingHeader() {
  const [greeting, setGreeting] = useState("Boa noite");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Bom dia");
    } else if (hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 bg-white rounded-full blur-xl absolute -inset-2"></div>
          <div className="w-10 h-10 bg-white rounded-full relative"></div>
        </div>
        <span className="text-2xl font-medium">{greeting}</span>
      </div>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}
