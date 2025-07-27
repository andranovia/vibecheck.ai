"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Settings,
  Zap,
  Brain,
  Bot
} from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  messagesLength: number;
}

export function ChatInput({ 
  input, 
  setInput, 
  onSend, 
  isLoading, 
  messagesLength 
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedModel, setSelectedModel] = useState("vibecheck-pro");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const models = [
    { id: "vibecheck-pro", name: "VibeCheck Pro", icon: Zap, color: "text-primary" },
    { id: "creative-companion", name: "Creative Companion", icon: Sparkles, color: "text-pink-500" }
  ];

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    // Image upload logic would go here
    console.log("Image upload clicked");
  };

  const currentModel = models.find(m => m.id === selectedModel);
  const ModelIcon = currentModel?.icon || Bot;

  return (
    <div className="border-t border-border/50 bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-sm fixed bottom-0 w-full z-10">
      {/* Model Selector */}
      <div className="px-6 py-3 border-b border-border/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ModelIcon className={`h-4 w-4 ${currentModel?.color}`} />
              <span className="text-sm font-medium text-foreground">{currentModel?.name}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {models.map((model) => {
              const Icon = model.icon;
              return (
                <Button
                  key={model.id}
                  variant={selectedModel === model.id ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 px-3 ${
                    selectedModel === model.id 
                      ? "bg-primary/10 text-primary hover:text-primary hover:bg-primary/10" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  <span className="text-xs">{model.name.split(' ')[0]}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Input Area */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            {/* Left Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                onClick={handleFileUpload}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
                onClick={handleImageUpload}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Text Input Area */}
            <div className="flex-1 relative group">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  placeholder="Share your thoughts, feelings, or what's on your mind..."
                  className="min-h-[80px] max-h-[160px] resize-none border-border/50 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm hover:bg-background/90 focus:bg-background pr-20 pl-4 py-4 text-base rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                />

                {/* Input Actions */}
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 transition-all duration-200 ${
                      isRecording 
                        ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={handleVoiceToggle}
                  >
                    {isRecording ? (
                      <MicOff className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>

                </div>

                {/* Character Counter */}
                <div className="absolute top-3 right-3 text-xs text-muted-foreground opacity-0 group-focus-within:opacity-100 transition-opacity">
                  {input.length > 0 && `${input.length} chars`}
                </div>
              </div>

              {/* Voice Recording Indicator */}
              {isRecording && (
                <div className="absolute -top-12 left-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-600">Recording...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={onSend}
                disabled={!input.trim() || isLoading}
                className="h-[40px] px-8 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/95 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {isLoading ? (
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Send className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-200 relative z-10" />
                )}
              </Button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                Press Enter to send • Shift+Enter for new line
              </p>
              
              {input.length > 500 && (
                <Badge variant="outline" className="text-xs">
                  Long message
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {messagesLength > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setInput("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Show suggestions
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md"
        onChange={(e) => {
          // File upload logic would go here
          console.log("File selected:", e.target.files?.[0]);
        }}
      />
    </div>
  );
}
