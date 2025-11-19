"use client";

import { LayoutGrid, ShoppingCart, CheckCircle, BarChart, Home } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "supermercado", icon: ShoppingCart, label: "Supermercado" },
    { id: "produtividade", icon: CheckCircle, label: "Produtividade" },
    { id: "financas", icon: BarChart, label: "Finanças" },
]

export function BottomNav() {
    const [active, setActive] = useState("dashboard");

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
            <div className="relative">
                <div 
                    className="absolute -inset-px rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-rose-500"
                    style={{
                        animation: 'spin 4s linear infinite',
                    }}
                ></div>
                <nav className="relative bg-black/50 backdrop-blur-lg rounded-full p-2 flex justify-around items-center">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActive(item.id)}
                            className={cn(
                                "p-3 rounded-full transition-colors duration-300 ease-in-out",
                                active === item.id 
                                    ? "bg-white/10 text-white" 
                                    : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            <item.icon size={24} />
                        </button>
                    ))}
                </nav>
            </div>
             <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
