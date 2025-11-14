"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music2, Quote as QuoteIcon, Film, Tv, BookOpen,
    ExternalLink, Play, Pause, Sparkles
} from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import ActiveSession from "./ActiveSession";
import { Message, Suggestion, useMessagesStore } from "@/lib/store";

/** -------------- Helpers -------------- */
function useAudio(url?: string) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!url) return;
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlaying(false);
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, [url]);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
            setPlaying(true);
        }
    };
    return { playing, toggle, hasAudio: !!url };
}

/** -------------- UI Pieces -------------- */
function SuggestionCard({ s }: { s: Suggestion }) {
    if (s.type === "music") {
        const { playing, toggle, hasAudio } = useAudio(s.previewUrl);
        return (
            <div className="group relative flex items-center gap-3 rounded-sm border border-white/10 bg-gradient-to-br from-primary/10 to-background/40 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
                    <Music2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.title}</div>
                    {s.subtitle && <div className="truncate text-xs text-foreground/60">{s.subtitle}</div>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {hasAudio && (
                        <div
                            onClick={toggle}
                            className="rounded-md border border-white/10 p-1.5 hover:bg-white/5"
                            aria-label={playing ? "Pause preview" : "Play preview"}
                        >
                            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </div>
                    )}
                    {s.link && (
                        <a
                            href={s.link}
                            target="_blank"
                            className="rounded-md border border-white/10 p-1.5 hover:bg-white/5"
                            aria-label="Open"
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>
        );
    }

    if (s.type === "quote") {
        return (
            <div className="relative rounded-sm border border-white/10 bg-gradient-to-br from-card/40 to-background/30 px-3 py-2">
                <div className="flex items-start gap-2">
                    <QuoteIcon className="mt-0.5 h-4 w-4 text-primary/80" />
                    <div>
                        <p className="text-sm italic leading-snug">“{s.text}”</p>
                        {s.author && <p className="mt-1 text-xs text-foreground/60">— {s.author}</p>}
                    </div>
                </div>
            </div>
        );
    }

    if (s.type === "book" || s.type === "movie" || s.type === "series") {
        const Ico = s.type === "book" ? BookOpen : s.type === "movie" ? Film : Tv;
        return (
            <div className="group relative flex items-center gap-3 rounded-sm border border-white/10 bg-gradient-to-br from-primary/5 to-background/30 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
                    <Ico className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.title}</div>
                    {(s.note || s.year) && (
                        <div className="truncate text-xs text-foreground/60">
                            {[s.note, s.year].filter(Boolean).join(" • ")}
                        </div>
                    )}
                </div>
                {s.link && (
                    <a
                        href={s.link}
                        target="_blank"
                        className="ml-auto rounded-md border border-white/10 p-1.5 hover:bg-white/5"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </a>
                )}
            </div>
        );
    }

    if (s.type === "action") {
        return (
            <button className="flex w-full items-center justify-between rounded-sm border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-left transition hover:bg-emerald-400/15">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{s.label}</span>

                </div>

                <div className="ml-auto flex items-center gap-2">
                    <div
                        onClick={() => { }}
                        className="rounded-md border border-white/10 p-1.5 flex justify-center items-center"
                    >
                        {s.minutes ? <span className="text-xs text-emerald-400">{s.minutes}m</span> : null}
                    </div>
                    <div
                        onClick={() => { }}
                        className="rounded-md border border-white/10 p-1.5 hover:bg-white/5"
                    >
                        <Play className="h-4 w-4 text-emerald-400" />
                    </div>
                </div>
            </button>
        );
    }

    return null;
}

function MessageFooter({ message, mood }: { message: Message; mood: string }) {
    const suggestions = useMemo(
        () => (message.suggestions && message.suggestions.length > 0
            ? message.suggestions
            : []),
        [message, mood]
    ).slice(0, 2);

    if (message.type !== "assistant" || suggestions.length === 0) return null;
    return (
        <AnimatePresence initial={false}>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="mt-4 space-y-2"
            >
                {suggestions.map((s, i) => (
                    <SuggestionCard key={`${message.id}-sugg-${i}`} s={s} />
                ))}
            </motion.div>
        </AnimatePresence>
    );
}

/** -------------- Main Panel -------------- */
interface SidebarProps { isOpen: boolean; }

export function SidePanel({ isOpen }: SidebarProps) {
    const messages = useMessagesStore((state) => state.messages);

    // Don't render if not open or no messages
    if (!isOpen || messages.length === 0) return null;

    const [mood]: "happy" | "excited" | "calm" | "sad" | "neutral" = "sad"; // This should be dynamic based on latest AI message mood

    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-full bg-gradient-to-b from-card/60 via-card/50 to-card/40 backdrop-blur-md border-r border-border/60 flex flex-col shadow-xl shadow-black/5 border-l">
                {/* Header */}
                <div className="p-4 bg-primary/5 m-4 rounded-sm flex items-center gap-4">
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mood === "happy"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30"
                            : mood === "excited"
                                ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30"
                                : mood === "calm"
                                    ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30"
                                    : mood === "sad"
                                        ? "bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800/30"
                                        : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30"
                            }`}
                    >
                        <span className="text-md">
                            {mood === "happy" ? "😊" : mood === "excited" ? "🎉" : mood === "calm" ? "😌" : mood === "sad" ? "😔" : "😐"}
                        </span>
                    </div>
                    <h2 className="text-lg font-semibold">Work Stress...</h2>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 pb-6 h-[calc(100%-617.76px)]">
                    <div className="relative space-y-6 pr-2 ">
                        {messages.map((message) => {
                            const isUser = message.type === "user";
                            return (
                                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse text-right" : "flex-row"}`}>
                                        <div
                                            className={`group relative w-full rounded-3xl p-5 backdrop-blur-3xl transition-transform duration-300 ease-out ${isUser ? "text-primary" : "text-primary"
                                                }`}
                                        >
                                            <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.25em] ${isUser ? "flex-row-reverse" : ""}`}>
                                                <span className="text-[11px] font-semibold tracking-[0.28em]">{message.type === "user" ? "You" : "Vibecheck ai"}</span>
                                            </div>

                                            <p className="mt-4 text-2xl leading-relaxed text-foreground/90">{message.content}</p>

                                            {/* Footer with suggestions (AI only) */}
                                            <MessageFooter message={message} mood={mood} />

                                            <div className={`mt-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50 ${isUser ? "text-right" : ""}`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div
                                                className={`pointer-events-none absolute top-1/2 hidden h-[2px] w-10 -translate-y-1/2 rounded-full blur ${isUser
                                                    ? "right-[-38px] bg-gradient-to-l from-primary/60 via-primary/30 to-transparent"
                                                    : "left-[-38px] bg-gradient-to-r from-sky-400/60 via-sky-300/30 to-transparent"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Mood card */}
                <ActiveSession/>

            </div>
        </TooltipProvider>
    );
}
