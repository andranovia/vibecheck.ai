"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
    isOpen: boolean;
}



export function SidePanel({ isOpen }: SidebarProps) {

    if (!isOpen) return null;
    const [mood] = "sad";

    const conversation: Array<{
        id: string;
        author: "ai" | "user";
        name: string;
        tone: string;
        content: string;
        timestamp: string;
        tags: string[];
        avatar?: string;
    }> = [
            {
                id: "msg-ai-1",
                author: "ai",
                name: "Vibecheck AI",
                tone: "grounding coach",
                content:
                    "I'm picking up fatigue spikes and scattered focus. Let's anchor together with a 4-2-6 breath so your nervous system can exhale some of that pressure.",
                timestamp: "2:14 PM",
                tags: ["breathwork", "reset"],
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
                <div className="p-4 bg-primary/5 m-4 rounded-sm flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mood === 'happy' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
                        mood === 'excited' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30' :
                            mood === 'calm' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' :
                                mood === 'sad' ? 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800/30' :
                                    'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30'
                        }`}>
                        <span className="text-md">
                            {mood === 'happy' ? '😊' :
                                mood === 'excited' ? '🎉' :
                                    mood === 'calm' ? '😌' :
                                        mood === 'sad' ? '😔' : '😐'}
                        </span>
                    </div>
                    <h2 className="text-lg font-semibold">Work Stress...</h2>
                </div>

                <ScrollArea className="flex-1 px-4 pb-6 h-[calc(100%-317.76px)]">
                    <div className="relative space-y-6 pr-2 ">
                        {conversation.map((message) => {
                            const isUser = message.author === "user";

                            return (
                                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse text-right" : "flex-row"}`}>

                                        <div
                                            className={`group relative w-full rounded-3xl p-5 backdrop-blur-3xl transition-transform duration-300 ease-out ${isUser
                                                ? "text-primary"
                                                : "text-primary"
                                                }`}
                                        >
                                             {/* <div className={`absolute inset-0 rounded-full blur-xl ${isUser ? "bg-primary/35 right-[20%]" : "bg-sky-400/30"}`} /> */}
                                            <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.25em] ${isUser ? "flex-row-reverse" : ""}`}>
                                                <span className="text-[11px] font-semibold tracking-[0.28em]">
                                                    {message.name}
                                                </span>
                                            </div>
                                            <p className="mt-4 text-2xl leading-relaxed text-foreground/90">
                                                {message.content}
                                            </p>
                                            <div className={`mt-4 text-[10px] uppercase tracking-[0.4em] text-foreground/50 ${isUser ? "text-right" : ""}`}>
                                                {message.timestamp}
                                            </div>
                                            <div className={`pointer-events-none absolute top-1/2 hidden h-[2px] w-10 -translate-y-1/2 rounded-full blur ${isUser
                                                ? "right-[-38px] bg-gradient-to-l from-primary/60 via-primary/30 to-transparent"
                                                : "left-[-38px] bg-gradient-to-r from-sky-400/60 via-sky-300/30 to-transparent"
                                                }`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </ScrollArea>
                <div className="px-4 pb-6">
                    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-card/60 to-background/40 p-5">
                        <div className="relative flex items-end justify-between gap-6">
                            <div>
                                <span className="text-[11px] uppercase tracking-[0.45em] text-primary/80">
                                    Mood Trajectory
                                </span>
                                <h3 className="mt-3 text-lg font-semibold text-foreground">
                                    Stability recovering
                                </h3>
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
        </TooltipProvider >
    );
}
