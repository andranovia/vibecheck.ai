"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, PanelLeft } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeaderProps {
    onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <header className="flex items-center justify-between px-6 py-4  backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="hover:bg-sidebar"
                >
                    <PanelLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        {/* <Sparkles className="h-6 w-6 text-primary animate-pulse" /> */}
                        <Image src={"/vibecheck-logo.svg"} alt="Logo" width={24} height={24} className="h-8 w-8" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        vibecheck.ai
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="hover:bg-sidebar"
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </header>
    );
}
