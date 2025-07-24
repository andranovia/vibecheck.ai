"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Plus, 
  History, 
  Music, 
  Quote, 
  Image as ImageIcon,
  Heart,
  Smile,
  Frown,
  Meh
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const recentChats = [
    { id: '1', title: 'Feeling creative today', mood: 'happy', timestamp: '2h ago' },
    { id: '2', title: 'Need some motivation', mood: 'neutral', timestamp: '1d ago' },
    { id: '3', title: 'Stressed about work', mood: 'sad', timestamp: '2d ago' },
  ];

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-green-500" />;
      case 'sad': return <Frown className="h-4 w-4 text-blue-500" />;
      case 'neutral': return <Meh className="h-4 w-4 text-yellow-500" />;
      default: return <Heart className="h-4 w-4 text-primary" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90" size="lg">
          <Plus className="h-5 w-5" />
          New Vibe Check
        </Button>
      </div>

      <Separator />

      {/* Recent Chats */}
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-sidebar-foreground">Recent Chats</h3>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <Card key={chat.id} className="cursor-pointer hover:bg-sidebar-accent/50 transition-colors border-sidebar-border/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {getMoodIcon(chat.mood)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
            <Music className="h-4 w-4" />
            Song Recommendations
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
            <Quote className="h-4 w-4" />
            Inspirational Quotes
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
            <ImageIcon className="h-4 w-4" />
            Mood Images
          </Button>
        </div>
      </div>

      {/* Mood Stats */}
      <div className="p-4 border-t border-sidebar-border">
        <Card className="bg-sidebar-accent/30 border-sidebar-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-sidebar-foreground">Today's Vibe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Overall Mood</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Positive
              </Badge>
            </div>
            <div className="flex gap-1">
              <div className="h-2 bg-primary rounded-full flex-1"></div>
              <div className="h-2 bg-primary/60 rounded-full flex-1"></div>
              <div className="h-2 bg-primary/30 rounded-full flex-1"></div>
              <div className="h-2 bg-muted rounded-full flex-1"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
