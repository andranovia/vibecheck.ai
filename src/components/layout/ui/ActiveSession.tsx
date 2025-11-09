import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Pause, Square, Volume2, Zap, Clock } from 'lucide-react';

type ActivityMode = "idle" | "running" | "paused" | "completed";

export default function ActiveSession() {
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

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && currentActivity.mode === "running" && currentActivity.hasMusic) {
            const interval = setInterval(() => {
                setSoundWave(prev => prev.map(() => 0.3 + Math.random() * 0.7));
            }, 150);
            return () => clearInterval(interval);
        }
    }, [isHydrated, currentActivity.mode, currentActivity.hasMusic]);

    const togglePlayPause = () => {
        setCurrentActivity(prev => ({
            ...prev,
            mode: prev.mode === "running" ? "paused" : "running"
        }));
    };

    const endSession = () => {
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

    return (
        <div className=" bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
            <div className="w-full">
                {/* Main Card */}
                <div className="relative group">
                    {/* Ambient glow effect that follows the card */}
                    <div
                        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                            animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                    />

                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-zinc-900/90 via-zinc-800/50 to-zinc-900/90 backdrop-blur-xl">
                        {/* Animated mesh gradient background */}
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                            <div className="absolute top-0 -right-4 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                        </div>

                        {/* Noise texture overlay */}
                        <div className="absolute inset-0 opacity-[0.015]" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }} />

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
                                            stroke="rgba(255,255,255,0.05)"
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
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/80">
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

                                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">
                                        {currentActivity.title}
                                    </h3>

                                    <p className="text-xs text-white/50 leading-relaxed">
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
                                    <div className="group/badge flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sky-500/30 transition-all duration-300 cursor-pointer">
                                        <Volume2 className="w-3 h-3 text-sky-400 group-hover/badge:scale-110 transition-transform" />
                                        <span className="text-[10px] font-medium text-white/70">Lo-fi focus</span>
                                        <div className="w-1 h-1 rounded-full bg-sky-400/50 group-hover/badge:animate-pulse" />
                                    </div>
                                )}
                                {currentActivity.hasRitual && (
                                    <div className="group/badge flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer">
                                        <Sparkles className="w-3 h-3 text-emerald-400 group-hover/badge:scale-110 transition-transform" />
                                        <span className="text-[10px] font-medium text-white/70">Micro-reset</span>
                                        <Zap className="w-2.5 h-2.5 text-emerald-400/70" />
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 ml-auto">
                                    <Clock className="w-3 h-3 text-purple-400" />
                                    <span className="text-[10px] font-bold text-white/90">{currentActivity.eta}</span>
                                </div>
                            </div>

                            <div className='flex justify-center items-center gap-4'>
                                <div className="relative w-full ">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-purple-400 rounded-full transition-all duration-500 relative"
                                            style={{ width: `${currentActivity.progress * 100}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                                        </div>
                                    </div>
                                    {/* Progress text */}
                                    <div className="flex justify-between items-center mt-2 text-[10px] text-white/40">
                                        <span>In sync with your flow</span>
                                        <span className="font-mono text-white/60">{currentActivity.eta} remaining</span>
                                    </div>
                                </div>

                                {/* Control buttons - floating style */}
                                <div className="flex items-center gap-2 justify-between w-[35%]">
                                    <button
                                        onClick={togglePlayPause}
                                        onMouseEnter={() => setHoveredAction('play')}
                                        onMouseLeave={() => setHoveredAction(null)}
                                        className="flex-1 group/btn relative overflow-hidden rounded-md bg-gradient-to-r from-emerald-500 to-sky-500 p-[1px] transition-all duration-200"
                                    >
                                        <div className="relative bg-background rounded-md px-3 h-11 flex items-center justify-center gap-2 group-hover/btn:bg-background/70 transition-colors">
                                            {currentActivity.mode === "running" ? (
                                                <Pause className="w-4 h-4 text-white" />
                                            ) : (
                                                <Play className="w-4 h-4 text-white" />
                                            )}
                                            <span className="text-sm font-medium text-white">
                                                {currentActivity.mode === "running" ? "Pause" : "Resume"}
                                            </span>
                                            {hoveredAction === 'play' && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-sky-500/20" />
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={endSession}
                                        onMouseEnter={() => setHoveredAction('end')}
                                        onMouseLeave={() => setHoveredAction(null)}
                                        className="relative rounded-md bg-white/5 border border-white/10 px-4  h-[46px] hover:bg-white/10 hover:border-red-500/30 transition-all duration-200 group/end"
                                    >
                                        <Square className="w-4 h-4 text-white/70 group-hover/end:text-red-400 transition-colors" />
                                        {hoveredAction === 'end' && (
                                            <div className="absolute inset-0 bg-red-500/10 rounded-md" />
                                        )}
                                    </button>
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