"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useApiKeysStore, CustomProxy } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Sparkles,
  Mic,
  MicOff,
  Paperclip,
  Settings,
  ChevronDown,
  Bot,
  Zap,
  Brain,
  RouteOff,
  Rabbit,
  Plus,
  Volume2,
} from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  messagesLength: number;
  onOpenSettings?: () => void;
  onModeChange?: (mode: string) => void;
  onModelChange?: (model: string) => void;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon: any;
  color: string;
  description: string;
  features: string[];
  isCustom?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  messagesLength,
  onOpenSettings,
  onModeChange,
  onModelChange,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMode, setSelectedMode] = useState("vibecheck-pro");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { defaultModel, customProxies, setDefaultModel } = useApiKeysStore();
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  
  // Update selected model when default changes
  useEffect(() => {
    setSelectedModel(defaultModel);
  }, [defaultModel]);
  
  // When user changes model, update the default
  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setDefaultModel(modelId);
    if (onModelChange) {
      onModelChange(modelId);
    }
  };

  const modes = [
    {
      id: "vibecheck-pro",
      name: "VibeCheck Pro",
      icon: Zap,
      color: "text-primary",
    },
    {
      id: "creative-companion",
      name: "Creative Companion",
      icon: Sparkles,
      color: "text-pink-500",
    },
  ];

  const models: AIModel[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      provider: "OpenAI",
      icon: Brain,
      color: "text-green-600",
      description: "Most capable model for complex tasks",
      features: ["Reasoning", "Code", "Analysis"],
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      provider: "OpenAI",
      icon: Zap,
      color: "text-blue-600",
      description: "Fast and efficient for most tasks",
      features: ["Speed", "General", "Cost-effective"],
    },
    {
      id: "claude-3-opus",
      name: "Claude 3 Opus",
      provider: "Anthropic",
      icon: Sparkles,
      color: "text-purple-600",
      description: "Excellent for writing and analysis",
      features: ["Writing", "Reasoning", "Creative"],
    },
    {
      id: "claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "Anthropic",
      icon: Bot,
      color: "text-orange-600",
      description: "Balanced performance and speed",
      features: ["Balanced", "Fast", "Reliable"],
    },
    {
      id: "llama-2-70b",
      name: "Llama 2 70B",
      provider: "Meta",
      icon: Rabbit,
      color: "text-indigo-600",
      description: "Open source alternative",
      features: ["Open Source", "Privacy", "Local"],
    },
  ];

  const customProxyModels: AIModel[] = customProxies.map(proxy => ({
    id: proxy.id,
    name: proxy.configName,
    provider: proxy.provider,
    icon: RouteOff,
    color: "text-teal-600",
    description: `${proxy.modelName} (${proxy.endpoint})`,
    features: proxy.features,
    isCustom: true
  }));

  const allModels = [...models, ...customProxyModels];

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const currentModel = allModels.find((m) => m.id === selectedModel);
  const ModelIcon = currentModel?.icon || Bot;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend();
      }
    }
  };

  return (
    <TooltipProvider>
      <div className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Main Input Container */}
          <div className="relative bg-background rounded-2xl border border-border/60  group">
            {/* Model Selector Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 px-3 hover:bg-muted/50 transition-colors group/trigger"
                  >
                    <div className="flex items-center gap-2">
                      <ModelIcon className={`h-4 w-4 ${currentModel?.color}`} />
                      <span className="text-sm font-medium text-foreground">
                        {currentModel?.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {currentModel?.provider}
                      </Badge>
                    </div>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-50 group-hover/trigger:opacity-100 transition-opacity" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-80 p-2 -ml-4 h-[20rem] overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
                  sideOffset={30}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">
                      AI Models
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Choose your preferred AI assistant
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  {models.map((model) => {
                    const Icon = model.icon;
                    return (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => handleModelChange(model.id)}
                        className="p-3 cursor-pointer focus:bg-muted/50"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <Icon
                            className={`h-5 w-5 mt-0.5 ${model.color} flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">
                                {model.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {model.provider}
                              </Badge>
                              {selectedModel === model.id && (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {model.description}
                            </p>
                            <div className="flex gap-1 mt-1 pt-2">
                              {model.features.map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">
                      Custom Configurations
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your custom model configurations
                    </p>
                  </div>

                  {customProxyModels && customProxyModels?.length > 0 ? (
                    customProxyModels.map((model) => {
                      const Icon = model.icon;
                      return (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => handleModelChange(model.id)}
                          className="p-3 cursor-pointer focus:bg-muted/50"
                        >
                          <div className="flex items-start gap-3 w-full">
                            <Icon
                              className={`h-5 w-5 mt-0.5 ${model.color} flex-shrink-0`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-foreground">
                                  {model.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {model.provider}
                                </Badge>
                                {selectedModel === model.id && (
                                  <Badge variant="default" className="text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {model.description}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {model.features.map((feature) => (
                                  <Badge
                                    key={feature}
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })
                  ) : (
                    <div className="p-10 text-sm text-muted-foreground">
                      <div className="flex flex-col items-center gap-5">
                        <RouteOff className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm ">No custom proxies configured.</span>
                      </div>
                    </div>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="p-3 cursor-pointer focus:bg-muted/50">
                    <div className="flex items-center gap-3 w-full">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-sm text-foreground">
                          Add Custom Endpoint
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Configure your own API
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.id}
                      variant={selectedMode === mode.id ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 px-3 ${
                        selectedMode === mode.id
                          ? "bg-primary/10 text-primary hover:text-primary hover:bg-primary/10"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setSelectedMode(mode.id);
                        if (onModeChange) {
                          onModeChange(mode.id);
                        }
                      }}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      <span className="text-xs">{mode.name.split(" ")[0]}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-3 items-end">
                {/* Left Actions */}
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-[52px] w-9 hover:bg-muted/50 transition-colors"
                        onClick={handleFileUpload}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attach file</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${currentModel?.name}...`}
                    className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent p-3 pr-12 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground/60"
                    onKeyDown={handleKeyDown}
                  />

                  {/* Voice Input Button */}
                  <div className="absolute right-3 bottom-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRecording ? "Stop recording" : "Voice input"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute -top-12 left-0 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-600 font-medium">
                          Recording...
                        </span>
                        <Volume2 className="h-3 w-3 text-red-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-[52px] w-9 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group/send"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 group-hover/send:translate-x-0.5 transition-transform" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send • Shift+Enter for new line
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {messagesLength > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInput("")}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Suggestions
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Show conversation suggestions</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={onOpenSettings}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open chat settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.json,.csv"
          onChange={(e) => {
            // File upload logic would go here
            console.log("File selected:", e.target.files?.[0]);
          }}
        />
      </div>
    </TooltipProvider>
  );
}
