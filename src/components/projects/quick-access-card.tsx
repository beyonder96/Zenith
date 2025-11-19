'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";

export function QuickAccessCard() {
    return (
        <Card className="w-full max-w-md bg-white dark:bg-zinc-800 border-none shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-center">
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform">
                    <Play size={20} className="ml-0.5" />
                </button>
            </CardContent>
        </Card>
    );
}
