"use client";

import { Grid, ShoppingCart, CheckCircle, BarChart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
    { id: "dashboard", icon: Grid, label: "Dashboard", href: "/dashboard" },
    { id: "supermercado", icon: ShoppingCart, label: "Supermercado", href: "/supermercado" },
    { id: "produtividade", icon: CheckCircle, label: "Produtividade", href: "/dashboard" }, // Corrected link
    { id: "financas", icon: BarChart, label: "Finanças", href: "/finance" },
];

export function BottomNav({ active }: { active: string }) {

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
            <div className="relative group">
                <div 
                    className="absolute -inset-x-1 inset-y-0 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 opacity-40 blur-lg transition duration-1000 group-hover:opacity-60"
                ></div>
                <nav className="relative bg-zinc-900/80 backdrop-blur-lg rounded-full p-2 flex justify-around items-center border border-white/10">
                    {navItems.map((item) => (
                        <Link href={item.href} key={item.id} passHref>
                            <button
                                className={cn(
                                    "p-3 rounded-full transition-all duration-300 ease-in-out transform active:scale-90",
                                    active === item.id 
                                        ? "bg-white/20 text-white" 
                                        : "text-muted-foreground hover:bg-white/10 hover:text-white"
                                )}
                                aria-label={item.label}
                            >
                                <item.icon size={24} />
                            </button>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
