import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, Square, Volume2, Zap, Clock, ChevronUp } from 'lucide-react';
import { useTheme } from 'next-themes';


type ActivityMode = "idle" | "running" | "paused" | "completed";

export default function ActiveSession() {
    const { theme, resolvedTheme } = useTheme();
    const [currentActivity, setCurrentActivity] = useState({
        title: "90s Micro-reset + Lo-fi Focus",
        subtitle: "Breath • posture • hydration • lo-fi loop",
        mode: "running" as ActivityMode,
        progress: 0.42,
        eta: "01:05",
        hasMusic: true,
        hasRitual: true,
    });

    const [hoveredAction, setHoveredAction] = useState<string | null>(null);
    const [soundWave, setSoundWave] = useState(Array(12).fill(0.5));
    const [isHydrated, setIsHydrated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [lastInteraction, setLastInteraction] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsHydrated(true);
        setLastInteraction(Date.now());
    }, []);

    // Auto-collapse logic
    // useEffect(() => {
    //     const shouldAutoCollapse = currentActivity.mode === "idle" || currentActivity.mode === "completed";

    //     if (!shouldAutoCollapse && currentActivity.mode === "running") {
    //         // Auto-collapse after 10 seconds of no interaction when running
    //         const timer = setTimeout(() => {
    //             if (Date.now() - lastInteraction >= 10000) {
    //                 setIsExpanded(false);
    //             }
    //         }, 10000);
    //         return () => clearTimeout(timer);
    //     } else if (shouldAutoCollapse) {
    //         // Immediately collapse on idle/completed
    //         const timer = setTimeout(() => setIsExpanded(false), 2000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [currentActivity.mode, lastInteraction]);

    // Track user interaction
    const handleInteraction = () => {
        setLastInteraction(Date.now());
        if (!isExpanded) setIsExpanded(true);
    };

    useEffect(() => {
        if (currentActivity.mode === "running" && currentActivity.hasMusic) {
            const interval = setInterval(() => {
                setSoundWave(prev => prev.map(() => 0.3 + Math.random() * 0.7));
            }, 150);
            return () => clearInterval(interval);
        }
    }, [currentActivity.mode, currentActivity.hasMusic]);

    const togglePlayPause = () => {
        handleInteraction();
        setCurrentActivity(prev => ({
            ...prev,
            mode: prev.mode === "running" ? "paused" : "running"
        }));
    };

    const endSession = () => {
        handleInteraction();
        setCurrentActivity(prev => ({ ...prev, mode: "completed" }));
    };

    const statusConfig = {
        running: { color: "emerald", text: "Session active", glow: "0 0 20px rgba(16,185,129,0.4)" },
        paused: { color: "amber", text: "Session paused", glow: "0 0 20px rgba(251,191,36,0.4)" },
        completed: { color: "sky", text: "Session complete", glow: "0 0 20px rgba(56,189,248,0.4)" },
        idle: { color: "zinc", text: "Ready when you are", glow: "none" }
    };

    const status = statusConfig[currentActivity.mode];
    const progressDegrees = currentActivity.progress * 270;
    const isDark = resolvedTheme === 'dark';

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center p-4 min-h-[302.3px]">
                <div className="w-full h-[56px]" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`${isDark ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-black' : 'bg-gradient-to-br from-zinc-50 via-zinc-100 to-white'} flex items-center justify-center p-4`}
            onClick={handleInteraction}
        >
            <div className="w-full">
                {/* Main Card */}
                <div
                    className="relative group cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}>
                    {/* Ambient glow effect that follows the card */}
                    <div
                        className={`absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-purple-500/20 rounded-3xl blur-2xl transition-all duration-700 ${isExpanded ? 'opacity-75 group-hover:opacity-100' : 'opacity-40'
                            }`}
                        style={{
                            animation: isExpanded ? 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                        }}
                    />

                    <div
                        className={`relative overflow-hidden border ${isDark ? 'border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90' : 'border-zinc-200 bg-gradient-to-br from-white/95 via-zinc-50/80 to-white/95'} backdrop-blur-xl transition-all duration-700 ease-in-out rounded-md`}
                        style={{
                            height: isExpanded ? '302.3px' : '56px',
                        }}
                    >
                        {/* Animated mesh gradient background */}
                        <div
                            className={`absolute inset-0 transition-opacity duration-700 ${isExpanded ? 'opacity-30' : 'opacity-20'
                                }`}
                        >
                            <div className={`absolute top-0 -left-4 w-72 h-72 ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'} rounded-full mix-blend-multiply filter blur-3xl animate-blob`} />
                            <div className={`absolute top-0 -right-4 w-72 h-72 ${isDark ? 'bg-sky-500' : 'bg-sky-400'} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000`} />
                            <div className={`absolute -bottom-8 left-20 w-72 h-72 ${isDark ? 'bg-purple-500' : 'bg-purple-400'} rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000`} />
                        </div>

                        {/* Noise texture overlay */}
                        <div className="absolute inset-0 opacity-[0.015]" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }} />

                        {/* Collapsed Mini Bar - Dynamic Island Style */}
                        <div
                            className={`absolute inset-0 flex items-center px-6 transition-all duration-500 ${isExpanded ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
                                }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {/* Pulsing status dot */}
                                <div className="relative flex-shrink-0">
                                    <div
                                        className={`w-2.5 h-2.5 rounded-full bg-${status.color}-400`}
                                        style={{ boxShadow: status.glow }}
                                    />
                                    {currentActivity.mode === "running" && (
                                        <>
                                            <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                                            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse" />
                                        </>
                                    )}
                                </div>

                                {/* Mini waveform */}
                                {currentActivity.hasMusic && currentActivity.mode === "running" && (
                                    <div className="flex items-center gap-0.5 h-4">
                                        {soundWave.slice(0, 6).map((height, i) => (
                                            <div
                                                key={i}
                                                className="w-0.5 bg-gradient-to-t from-emerald-400 via-sky-400 to-purple-400 rounded-full transition-all duration-150"
                                                style={{
                                                    height: `${height * 60}%`,
                                                    opacity: 0.6 + height * 0.4
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Compact title */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'} truncate`}>
                                        {currentActivity.title}
                                    </div>
                                </div>

                                {/* Mini progress ring */}
                                <div className="relative flex-shrink-0">
                                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="14"
                                            fill="none"
                                            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="14"
                                            fill="none"
                                            stroke="url(#miniProgressGradient)"
                                            strokeWidth="2"
                                            strokeDasharray={`${progressDegrees * 0.244} 87.96`}
                                            strokeLinecap="round"
                                            className="transition-all duration-500"
                                        />
                                        <defs>
                                            <linearGradient id="miniProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="50%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isDark ? 'text-white/80' : 'text-zinc-900/80'}`}>
                                        {Math.round(currentActivity.progress * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Full Card */}
                        <div
                            className={`relative transition-all duration-700 ${isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                }`}
                            style={{
                                transitionDelay: isExpanded ? '100ms' : '0ms'
                            }}
                        >
                            <div className="relative p-6">
                                {/* Header with circular progress */}
                                <div className="flex items-start gap-4 mb-6">
                                    {/* Circular progress indicator */}
                                    <div className="relative flex-shrink-0">
                                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                            {/* Background ring */}
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                fill="none"
                                                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                                                strokeWidth="2"
                                            />
                                            {/* Progress ring */}
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                fill="none"
                                                stroke="url(#progressGradient)"
                                                strokeWidth="2"
                                                strokeDasharray={`${progressDegrees * 0.488} 175.93`}
                                                strokeLinecap="round"
                                                className="transition-all duration-500 ease-out"
                                                style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }}
                                            />
                                            <defs>
                                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="50%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        {/* Center status indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative">
                                                <div
                                                    className={`w-3 h-3 rounded-full bg-${status.color}-400`}
                                                    style={{ boxShadow: status.glow }}
                                                />
                                                {currentActivity.mode === "running" ? (
                                                    <>
                                                        <div className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
                                                        <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse" />
                                                    </>
                                                ) : <>
                                                    <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
                                                    <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse" />
                                                </>}
                                            </div>
                                        </div>

                                        {/* Percentage */}
                                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold ${isDark ? 'text-white/80' : 'text-zinc-900/80'}`}>
                                            {Math.round(currentActivity.progress * 100)}%
                                        </div>
                                    </div>

                                    {/* Title and status */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">
                                                {status.text}
                                            </div>
                                            {currentActivity.mode === "running" && (
                                                <div className="flex gap-0.5">
                                                    {[0, 1, 2].map(i => (
                                                        <div
                                                            key={i}
                                                            className="w-0.5 h-2 bg-emerald-400 rounded-full"
                                                            style={{
                                                                animation: `pulse 1s ease-in-out infinite`,
                                                                animationDelay: `${i * 0.15}s`,
                                                                opacity: 0.6
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'} mb-1 leading-tight`}>
                                            {currentActivity.title}
                                        </h3>

                                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-zinc-600'} leading-relaxed`}>
                                            {currentActivity.subtitle}
                                        </p>
                                    </div>
                                </div>

                                {/* Sound wave visualization */}
                                {currentActivity.hasMusic && (currentActivity.mode === "running" || currentActivity.mode === "paused") && (
                                    <div className="flex items-center justify-center gap-0.5 h-12 mb-4 px-4">
                                        {soundWave.map((height, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-gradient-to-t from-emerald-400 via-sky-400 to-purple-400 rounded-full transition-all duration-150"
                                                style={{
                                                    height: `${height * 100}%`,
                                                    opacity: currentActivity.mode === "paused" ? 0.3 : 0.6 + height * 0.4
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Feature badges */}
                                <div className="flex items-center gap-2 mb-5">
                                    {currentActivity.hasMusic && (
                                        <div className={`group/badge flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 hover:border-sky-500/30' : 'bg-zinc-100 hover:bg-zinc-200 hover:border-sky-500/50'} border transition-all duration-300 cursor-pointer border-border`}>
                                            <Volume2 className="w-3 h-3 text-sky-400 group-hover/badge:scale-110 transition-transform" />
                                            <span className={`text-[10px] font-medium ${isDark ? 'text-white/70' : 'text-zinc-700'}`}>Lo-fi focus</span>
                                            <div className="w-1 h-1 rounded-full bg-sky-400/50 group-hover/badge:animate-pulse" />
                                        </div>
                                    )}
                                    {currentActivity.hasRitual && (
                                        <div className={`group/badge flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 hover:border-emerald-500/30' : 'bg-zinc-100 hover:bg-zinc-200 hover:border-emerald-500/50'} border transition-all duration-300 cursor-pointer border-border`}>
                                            <Sparkles className="w-3 h-3 text-emerald-400 group-hover/badge:scale-110 transition-transform" />
                                            <span className={`text-[10px] font-medium ${isDark ? 'text-white/70' : 'text-zinc-700'}`}>Micro-reset</span>
                                            <Zap className="w-2.5 h-2.5 text-emerald-400/70" />
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-zinc-100'} border ml-auto border-border `}>
                                        <Clock className="w-3 h-3 text-purple-400" />
                                        <span className={`text-[10px] font-bold ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>{currentActivity.eta}</span>
                                    </div>
                                </div>

                                <div className='flex justify-center items-center gap-4'>
                                    <div className="relative w-full ">
                                        <div className={`h-1 w-full ${isDark ? 'bg-white/5' : 'bg-zinc-200'} rounded-full overflow-hidden`}>
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 rounded-full transition-all duration-500 relative"
                                                style={{ width: `${currentActivity.progress * 100}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                                            </div>
                                        </div>
                                        {/* Progress text */}
                                        <div className={`flex justify-between items-center mt-2 text-[10px] ${isDark ? 'text-white/40' : 'text-zinc-500'}`}>
                                            <span>In sync with your flow</span>
                                            <span className={`font-mono ${isDark ? 'text-white/60' : 'text-zinc-700'}`}>{currentActivity.eta} remaining</span>
                                        </div>
                                    </div>

                                    {/* Control buttons - floating style */}
                                    <div className="flex items-center gap-2 justify-between w-[35%]">
                                        {/* Play/Pause Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                togglePlayPause();
                                            }}
                                            onMouseEnter={() => setHoveredAction('play')}
                                            onMouseLeave={() => setHoveredAction(null)}
                                            className="flex-1 group/btn relative overflow-hidden rounded-sm bg-background hover:bg-background/80 border border-border hover:border-primary/50 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <div className="relative px-4 h-11 flex items-center justify-center gap-2">
                                                {currentActivity.mode === "running" ? (
                                                    <Pause className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors duration-300" />
                                                ) : (
                                                    <Play className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors duration-300" />
                                                )}
                                                <span className="text-sm font-medium text-muted-foreground group-hover/btn:text-foreground transition-colors duration-300">
                                                    {currentActivity.mode === "running" ? "Pause" : "Resume"}
                                                </span>
                                            </div>
                                        </button>

                                        {/* End Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                endSession();
                                            }}
                                            onMouseEnter={() => setHoveredAction('end')}
                                            onMouseLeave={() => setHoveredAction(null)}
                                            className="relative rounded-sm bg-background hover:bg-background/80 border border-border hover:border-destructive/50 transition-all duration-300 backdrop-blur-sm px-4 h-11 group/end"
                                        >
                                            <Square className="w-4 h-4 text-muted-foreground group-hover/end:text-destructive transition-colors duration-300" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
        100% { transform: translateX(-100%); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-shimmer {
          animation: shimmer 4s infinite;
        }
      `}</style>
        </div>
    );
}