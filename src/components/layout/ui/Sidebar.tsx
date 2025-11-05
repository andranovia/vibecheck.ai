"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
} from "lucide-react";
import Image from "next/image";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
}

interface Conversation {
  id: string;
  title: string;
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'calm';
  timestamp: string;
  preview: string;
}


export function Sidebar({ isOpen }: SidebarProps) {

  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'Creative Energy',
      mood: 'excited',
      timestamp: '2h ago',
      preview: 'Feeling inspired and ready to create something amazing'
    },
    {
      id: '2',
      title: 'Morning Reflection',
      mood: 'calm',
      timestamp: 'Yesterday',
      preview: 'Starting the day with mindfulness and gratitude'
    },
    {
      id: '3',
      title: 'Work Stress',
      mood: 'sad',
      timestamp: '2d ago',
      preview: 'Having a tough day at work is really weighing me down'
    },
    {
      id: '4',
      title: 'Weekend Vibes',
      mood: 'happy',
      timestamp: '3d ago',
      preview: 'Relaxing and enjoying the weekend with friends and family'
    },
        {
      id: '5',
      title: 'Weekend Vibes',
      mood: 'happy',
      timestamp: '3d ago',
      preview: 'Relaxing and enjoying the weekend with friends and family'
    }
  ];


  if (!isOpen) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full bg-gradient-to-b from-card/60 via-card/50 to-card/40 backdrop-blur-md border-r border-border/60 flex flex-col shadow-xl shadow-black/5">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-br from-background to-accent/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Image src={"/vibecheck-logo.svg"} alt="Logo" width={24} height={24} className="h-8 w-8" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-foreground">VibeCheck</h2>
            <p className="text-xs text-muted-foreground/80">Track your emotional journey</p>
          </div>
        </div>

        <Button
          className="w-full h-11 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 text-sm font-medium rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Session
        </Button>
      </div>

      {/* Recent Conversations */}
      <div className="px-4 pt-4 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground">Recent conversations</h3>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <div className="w-1 h-1 rounded-full bg-primary/20" />
            <div className="w-1 h-1 rounded-full bg-primary/10" />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="space-y-2">
            {conversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className="group relative cursor-pointer p-3 rounded-xl hover:bg-accent/40 transition-all duration-200 border border-transparent hover:border-border/40 hover:shadow-sm"
                  >
                    {/* Mood indicator line */}
                    <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${conversation.mood === 'happy' ? 'bg-gradient-to-b from-emerald-400 to-emerald-300' :
                        conversation.mood === 'excited' ? 'bg-gradient-to-b from-orange-400 to-orange-300' :
                          conversation.mood === 'calm' ? 'bg-gradient-to-b from-blue-400 to-blue-300' :
                            conversation.mood === 'sad' ? 'bg-gradient-to-b from-gray-400 to-gray-300' :
                              'bg-gradient-to-b from-yellow-400 to-yellow-300'
                      }`} />

                    <div className="ml-4">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${conversation.mood === 'happy' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
                              conversation.mood === 'excited' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30' :
                                conversation.mood === 'calm' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30' :
                                  conversation.mood === 'sad' ? 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800/30' :
                                    'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30'
                            }`}>
                            <span className="text-xs">
                              {conversation.mood === 'happy' ? '😊' :
                                conversation.mood === 'excited' ? '🎉' :
                                  conversation.mood === 'calm' ? '😌' :
                                    conversation.mood === 'sad' ? '😔' : '😐'}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-foreground truncate">
                            {conversation.title}
                          </h4>
                        </div>
                        {index === 0 && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs text-primary font-medium">Live</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground/80 mb-2 line-clamp-2 w-4/5">
                        {conversation.preview}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground/60 font-medium">
                          {conversation.timestamp}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-4 h-4 rounded border border-border/50 flex items-center justify-center hover:bg-accent">
                            <span className="text-xs text-muted-foreground">→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Today's Vibe */}
      <div className="p-4 border-t border-border/30">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border border-primary/20 p-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-8 translate-x-8" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <span className="text-xs font-semibold text-foreground">Today's Vibe</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/10 flex items-center justify-center border border-blue-400/20">
                  <span className="text-xl">😌</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Calm & Focused</p>
                  <p className="text-xs text-muted-foreground/80">Perfect mindset for productivity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
