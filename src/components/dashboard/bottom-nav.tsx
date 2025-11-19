"use client";

import { BarChart3, CheckCircle2, LayoutGrid, ShoppingCart } from "lucide-react";

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border/50 flex justify-around items-center">
            <div className="absolute bottom-full left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
            <button className="p-2 text-muted-foreground">
                <LayoutGrid size={28} />
            </button>
            <button className="p-2 text-muted-foreground">
                <ShoppingCart size={28} />
            </button>
            <div className="relative">
                 <div className="absolute -inset-4 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full blur-lg"></div>
                 <button className="p-4 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full text-white relative">
                    <CheckCircle2 size={32} />
                </button>
            </div>
            <button className="p-2 text-muted-foreground">
                <BarChart3 size={28} />
            </button>
        </nav>
    );
}
