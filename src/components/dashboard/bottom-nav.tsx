"use client";

import { Grid, ShoppingCart, CheckCircle, BarChart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
    { id: "dashboard", icon: Grid, label: "Dashboard", href: "/dashboard" },
    { id: "supermercado", icon: ShoppingCart, label: "Supermercado", href: "/supermercado" },
    { id: "produtividade", icon: CheckCircle, label: "Produtividade", href: "/dashboard" },
    { id: "financas", icon: BarChart, label: "Finanças", href: "/finance" },
];

export function BottomNav({ active }: { active: string }) {
    const [clicked, setClicked] = useState<string | null>(null);

    const handleIconClick = (name: string) => {
        setClicked(name);
        setTimeout(() => setClicked(null), 300);
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 z-50">
            <div className="relative group w-full h-full p-[1.5px] rounded-3xl overflow-hidden shadow-lg">
                <div className="animated-border w-full h-full">
                    <div className="w-full h-full bg-gray-200/30 dark:bg-black/30 backdrop-blur-lg rounded-[22px] flex items-center justify-around">
                        {navItems.map((item) => (
                            <Link href={item.href} key={item.id} passHref>
                                <button
                                    onClick={() => handleIconClick(item.id)}
                                    className={cn(
                                        "group w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300",
                                        clicked === item.id && 'animate-bounce-click'
                                    )}
                                    aria-label={item.label}
                                >
                                    <item.icon 
                                      size={32}
                                      className={cn("transition-all duration-300",
                                      active === item.id ? 'text-black dark:text-white' : 'text-gray-600 dark:text-white/70'
                                    )}
                                    strokeWidth={1.5}
                                     />
                                </button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}