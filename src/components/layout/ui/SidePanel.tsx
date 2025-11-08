"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    Music2, Quote as QuoteIcon, Film, Tv, BookOpen,
    ExternalLink, Play, Pause, Sparkles, Heart, Bookmark
} from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

/** ---------------- Types ---------------- */
type Suggestion =
    | { type: "music"; title: string; subtitle?: string; link?: string; previewUrl?: string; mood?: string }
    | { type: "quote"; text: string; author?: string }
    | { type: "movie" | "series" | "book"; title: string; note?: string; year?: string; link?: string }
    | { type: "action"; label: string; minutes?: number; id?: string };

interface Message {
    id: string;
    author: "ai" | "user";
    name: string;
    tone: string;
    content: string;
    timestamp: string;
    tags: string[];
    avatar?: string;
    suggestions?: Suggestion[]; // new
}

/** -------------- Helpers -------------- */
/** tiny audio hook for local previews */
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

/** Fallback “AI chooses” suggestions if message has none */
function autoSuggest(msg: Message, mood: string): Suggestion[] {
    const fromTags = (tags: string[]) => ({
        breath: tags.some(t => /breath|reset/i.test(t)),
        focus: tags.some(t => /focus|micro/i.test(t)),
        overload: tags.some(t => /overload|switch/i.test(t)),
        calm: /calm|regulated/i.test(msg.tone) || mood === "calm",
    });

    const t = fromTags(msg.tags);

    // pick 1–2 suggestions
    const out: Suggestion[] = [];

    if (t.breath || t.calm) {
        out.push({
            type: "music",
            title: "Lo-fi Breathing Loop",
            subtitle: "60 BPM • gentle pads",
            // host a tiny mp3 in your public/ later; placeholder here
            previewUrl: "/audio/lofi-60bpm-preview.mp3",
            link: "https://open.spotify.com/",
            mood: "calm",
        });
        out.push({
            type: "quote",
            text: "The quieter you become, the more you are able to hear.",
            author: "Ram Dass",
        });
    } else if (t.focus) {
        out.push({
            type: "music",
            title: "Deep Focus (brown noise)",
            subtitle: "no lyrics",
            previewUrl: "/audio/brown-noise-15s.mp3",
            link: "https://open.spotify.com/",
            mood: "focus",
        });
        out.push({
            type: "action",
            label: "90-second micro-reset",
            minutes: 2,
        });
    } else if (t.overload) {
        out.push({
            type: "series",
            title: "3-min Box Breathing Guide",
            note: "short video",
            link: "https://youtu.be/",
        });
        out.push({
            type: "quote",
            text: "You do not rise to the level of your goals. You fall to the level of your systems.",
            author: "James Clear",
        });
    } else {
        out.push({
            type: "quote",
            text: "No rain, no flowers.",
        });
    }

    return out.slice(0, 2);
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
            : autoSuggest(message, mood)),
        [message, mood]
    ).slice(0, 2);

    if (message.author !== "ai" || suggestions.length === 0) return null;

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
    if (!isOpen) return null;

    const [mood]: "happy" | "excited" | "calm" | "sad" | "neutral" = "sad"; // fixed

    const conversation: Message[] = [
        {
            id: "msg-ai-1",
            author: "ai",
            name: "Vibecheck AI",
            tone: "grounding coach",
            content:
                "I'm picking up fatigue spikes and scattered focus. Let's anchor together with a 4-2-6 breath so your nervous system can exhale some of that pressure.",
            timestamp: "2:14 PM",
            tags: ["breathwork", "reset"],
            suggestions: [
                { type: "music", title: "Lo-fi Breathing Loop", subtitle: "60 BPM • gentle pads", link: "https://open.spotify.com/" },
                { type: "quote", text: "The quieter you become, the more you are able to hear.", author: "Ram Dass" }
            ]
        },
        {
            id: "msg-user-1",
            author: "user",
            name: "You",
            tone: "self check-in",
            content:
                "Today has been nonstop handoffs. My brain keeps replaying open loops and the inbox chime won't stop echoing.",
            timestamp: "2:16 PM",
            tags: ["overloaded", "context switch"],
        },
        {
            id: "msg-ai-2",
            author: "ai",
            name: "Vibecheck AI",
            tone: "micro-strategy",
            content:
                "Copy that. I'm sketching a 90-second micro-reset: stand, hydrate, then jot your top three priorities on a sticky. I'll dim notifications for 5 minutes so you can land.",
            timestamp: "2:17 PM",
            tags: ["micro-break", "focus ritual"],
            suggestions: [
                { type: "action", label: "Start 90-second micro-reset", minutes: 2 },
                { type: "music", title: "Deep Focus (brown noise)", subtitle: "no lyrics", link: "https://open.spotify.com/" }
            ]
        },
        {
            id: "msg-user-2",
            author: "user",
            name: "You",
            tone: "feedback loop",
            content:
                "Yes, that feels doable. Tracking a calmer pulse already—it's wild how a tiny ritual changes the temperature.",
            timestamp: "2:19 PM",
            tags: ["regulated", "momentum"],
        },
    ];

    const sparkline = [32, 48, 64, 52, 78, 92];

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
                <ScrollArea className="flex-1 px-4 pb-6 h-[calc(100%-317.76px)]">
                    <div className="relative space-y-6 pr-2 ">
                        {conversation.map((message) => {
                            const isUser = message.author === "user";
                            return (
                                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse text-right" : "flex-row"}`}>
                                        <div
                                            className={`group relative w-full rounded-3xl p-5 backdrop-blur-3xl transition-transform duration-300 ease-out ${isUser ? "text-primary" : "text-primary"
                                                }`}
                                        >
                                            <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.25em] ${isUser ? "flex-row-reverse" : ""}`}>
                                                <span className="text-[11px] font-semibold tracking-[0.28em]">{message.name}</span>
                                            </div>

                                            <p className="mt-4 text-2xl leading-relaxed text-foreground/90">{message.content}</p>

                                            {/* Footer with suggestions (AI only) */}
                                            <MessageFooter message={message} mood={mood} />

                                            <div className={`mt-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50 ${isUser ? "text-right" : ""}`}>
                                                {message.timestamp}
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
                <div className="px-4 pb-6">
                    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-card/60 to-background/40 p-5">
                        <div className="relative flex items-end justify-between gap-6">
                            <div>
                                <span className="text-[11px] uppercase tracking-[0.45em] text-primary/80">Mood Trajectory</span>
                                <h3 className="mt-3 text-lg font-semibold text-foreground">Stability recovering</h3>
                                <p className="mt-2 text-xs text-foreground/60">
                                    Keep the ritual going—I'll refresh your focus score after the next guided break.
                                </p>
                            </div>
                            <div className="relative flex h-20 w-28 items-end gap-1.5">
                                {sparkline.map((value, index) => (
                                    <span
                                        key={`spark-${index}`}
                                        className="w-2.5 rounded-full bg-gradient-to-t from-primary/5 via-primary/50 to-primary"
                                        style={{ height: `${value}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
