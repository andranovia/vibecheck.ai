"use client";

import {
    TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarProps {
    isOpen: boolean;
}



export function SidePanel({ isOpen }: SidebarProps) {


    if (!isOpen) return null;

    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-full bg-gradient-to-b from-card/60 via-card/50 to-card/40 backdrop-blur-md border-r border-border/60 flex flex-col shadow-xl shadow-black/5 border-l">
                {/* Header */}
                
            </div>
        </TooltipProvider>
    );
}
