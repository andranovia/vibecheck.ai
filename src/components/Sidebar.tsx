"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Sparkles
} from "lucide-react";

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

interface MoodTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const conversations: Conversation[] = [
    { 
      id: '1', 
      title: 'Creative Energy', 
      mood: 'excited', 
      timestamp: '2h ago',
      preview: 'Feeling inspired and ready to create...'
    },
    { 
      id: '2', 
      title: 'Morning Reflection', 
      mood: 'calm', 
      timestamp: 'Yesterday',
      preview: 'Starting the day with mindfulness...'
    },
    { 
      id: '3', 
      title: 'Work Stress', 
      mood: 'sad', 
      timestamp: '2d ago',
      preview: 'Having a tough day at work...'
    },
    { 
      id: '4', 
      title: 'Weekend Vibes', 
      mood: 'happy', 
      timestamp: '3d ago',
      preview: 'Relaxing and enjoying the weekend...'
    }
  ];

  const moodTemplates: MoodTemplate[] = [
    { id: 'happy', label: 'Happy', emoji: '😊', description: 'Feeling great', color: 'bg-green-500' },
    { id: 'excited', label: 'Excited', emoji: '🎉', description: 'Full of energy', color: 'bg-orange-500' },
    { id: 'calm', label: 'Calm', emoji: '😌', description: 'Peaceful mind', color: 'bg-blue-500' },
    { id: 'sad', label: 'Down', emoji: '😔', description: 'Need support', color: 'bg-gray-500' },
    { id: 'neutral', label: 'Neutral', emoji: '😐', description: 'Just okay', color: 'bg-yellow-500' },
    { id: 'stressed', label: 'Stressed', emoji: '😤', description: 'Overwhelmed', color: 'bg-red-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/80 to-primary/60 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">VibeCheck</h2>
            <p className="text-xs text-muted-foreground/70">Track your mood</p>
          </div>
        </div>
        
        <Button 
          className="w-full h-10 bg-gradient-to-r from-primary/90 to-primary/70 hover:from-primary hover:to-primary/80 text-primary-foreground border-0 shadow-sm hover:shadow-md transition-all duration-150 text-xs"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Check-in
        </Button>
      </div>

      {/* Quick Mood Selector */}
      <div className="p-4 border-b border-border/30">
        <h3 className="text-xs font-medium text-muted-foreground mb-3">How are you feeling?</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {moodTemplates.slice(0, 6).map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-2.5 rounded-lg border border-border/30 hover:border-border/60 transition-all duration-150 group ${
                selectedMood === mood.id ? 'border-primary/40 bg-primary/5' : 'hover:bg-accent/20'
              }`}
            >
              <div className="text-base mb-0.5">{mood.emoji}</div>
              <div className="text-xs font-medium text-foreground/80">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h3 className="text-xs font-medium text-muted-foreground">Recent</h3>
        </div>
        
        <ScrollArea className="h-[280px]">
          <div className="space-y-1">
            {conversations.map((conversation, index) => (
              <div 
                key={conversation.id} 
                className="group cursor-pointer p-3 rounded-lg hover:bg-accent/30 transition-all duration-150 border border-transparent hover:border-border/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      conversation.mood === 'happy' ? 'bg-emerald-400' :
                      conversation.mood === 'excited' ? 'bg-orange-400' :
                      conversation.mood === 'calm' ? 'bg-blue-400' :
                      conversation.mood === 'sad' ? 'bg-gray-400' :
                      'bg-yellow-400'
                    }`} />
                    <h4 className="text-xs font-medium text-foreground truncate">
                      {conversation.title}
                    </h4>
                  </div>
                  {index === 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground/70 truncate ml-4 mb-1">
                  {conversation.preview}
                </p>
                
                <div className="text-xs text-muted-foreground/50 ml-4">
                  {conversation.timestamp}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Summary */}
      <div className="p-4 border-t border-border/30">
        <div className="rounded-lg bg-accent/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-1 rounded-full bg-primary/60" />
            <span className="text-xs font-medium text-foreground/80">Current Mood</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg">😌</span>
            <div>
              <p className="text-xs text-foreground">Calm & Focused</p>
              <p className="text-xs text-muted-foreground/60">Ready for the day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
