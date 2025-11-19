"use client";

import { Home, ShoppingCart, CheckCircle, BarChart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "supermercado", icon: ShoppingCart, label: "Supermercado" },
    { id: "produtividade", icon: CheckCircle, label: "Produtividade" },
    { id: "financas", icon: BarChart, label: "Finanças" },
];

export function BottomNav() {
    const [active, setActive] = useState("dashboard");

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
            <div className="relative group">
                <div 
                    className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200 animate-tilt"
                ></div>
                <nav className="relative bg-black/70 backdrop-blur-lg rounded-full p-2 flex justify-around items-center border border-white/10">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={cn(
                                "p-3 rounded-full transition-all duration-300 ease-in-out transform active:scale-90",
                                active === item.id 
                                    ? "bg-white/20 text-white" 
                                    : "text-muted-foreground hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <item.icon size={24} />
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}
