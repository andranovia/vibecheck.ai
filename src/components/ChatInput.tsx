"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Waves,
  X,
  Check,
  Loader2
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

import { VoiceRecorder } from "./VoiceRecorder";
import { WaveSurferRecorder } from "./WaveSurferRecorder";
import { VoiceSettingsModal } from "./VoiceSettingsModal";
import { useVoiceStore } from "@/lib/voiceStore";
import { transcriptionService, TranscriptionResult } from "@/lib/transcriptionService";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

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
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { defaultModel, customProxies, setDefaultModel } = useApiKeysStore();
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const { visualizerType, autoTranscribe, primaryColor, secondaryColor, transcriptionLanguage, enableProfanityFilter } = useVoiceStore();

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
    if (isRecording) {
      setIsRecording(false);
      setShowRecorder(false);
    } else {
      setIsRecording(true);
      setShowRecorder(true);
      setTranscriptionText("");
      setRecordedAudioUrl(null);
    }
  };
  
  const handleRecordingComplete = async (blob: Blob) => {
    setIsRecording(false);
    
    // Create URL for audio playback
    const audioUrl = URL.createObjectURL(blob);
    setRecordedAudioUrl(audioUrl);
    
    if (autoTranscribe) {
      setIsTranscribing(true);
      try {
        // Use real transcription service with actual blob
        const result = await transcriptionService.transcribe(blob, {
          language: transcriptionLanguage,
          enableProfanityFilter,
        });
        setTranscriptionResult(result);
        setTranscriptionText(result.text);
      } catch (error) {
        console.error("Transcription failed:", error);
        setTranscriptionText("Transcription failed. Please try again.");
      } finally {
        setIsTranscribing(false);
      }
    }
  };
  
  const simulateTranscription = async (blob: Blob): Promise<void> => {
    if (!blob || blob.size === 0) {
      // If no blob is provided or attempting to transcribe an empty blob
      if (recordedAudioUrl) {
        try {
          // Fetch the blob from the URL
          const response = await fetch(recordedAudioUrl);
          const audioBlob = await response.blob();
          
          const result = await transcriptionService.transcribe(audioBlob, {
            language: transcriptionLanguage,
            enableProfanityFilter,
          });
          
          setTranscriptionResult(result);
          setTranscriptionText(result.text);
        } catch (error) {
          console.error("Transcription failed:", error);
          setTranscriptionText("Transcription failed. Please try again.");
        }
      } else {
        setTranscriptionText("No audio recording found to transcribe.");
      }
    } else {
      // Transcribe the provided blob directly
      try {
        const result = await transcriptionService.transcribe(blob, {
          language: transcriptionLanguage,
          enableProfanityFilter,
        });
        
        setTranscriptionResult(result);
        setTranscriptionText(result.text);
      } catch (error) {
        console.error("Transcription failed:", error);
        setTranscriptionText("Transcription failed. Please try again.");
      }
    }
  };
  
  const handleAcceptTranscription = () => {
    if (transcriptionText) {
      // Add the transcribed text to the input field
      // If the input already has text, add a space before the transcription
      setInput(input.trim() ? `${input.trim()} ${transcriptionText}` : transcriptionText);
      
      // Clear the recording state
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    }
    handleRecordingCancel();
  };
  
  const handleRecordingCancel = () => {
    setIsRecording(false);
    setShowRecorder(false);
    setTranscriptionText("");
    setIsTranscribing(false);
    setTranscriptionResult(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
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
      <div className=" bottom-0 z-50 border-t border-border/50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Main Input Container */}
          <div className="relative bg-background rounded-2xl border border-border/60  group">
            {/* Model Selector Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
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
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs/4 text-red-600">
                        Recording...
                      </span>
                    </div>
                  </div>
                )}</div>

              <div className="flex items-center gap-2">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Button
                      key={mode.id}
                      variant={selectedMode === mode.id ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 px-3 ${selectedMode === mode.id
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
                  <div className="absolute right-3 bottom-3 flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted/50 transition-colors"
                          onClick={() => setShowVoiceSettings(true)}
                        >
                          <Waves className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Voice settings</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 transition-all duration-200 ${isRecording
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
                        onClick={() => setShowVoiceSettings(true)}
                      >
                        <Waves className="h-3 w-3 mr-1" />
                        Voice Settings
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configure voice recording settings</p>
                    </TooltipContent>
                  </Tooltip>

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
            const file = e.target.files?.[0];
            if (file) {
              // Add file name to input
              setInput((current) => {
                const prefix = current.trim() ? `${current.trim()} ` : '';
                return `${prefix}[Attached: ${file.name}]`;
              });
              
              // Clear the file input for future uploads
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
        />
        
        {/* Voice Settings Modal */}
        <VoiceSettingsModal 
          open={showVoiceSettings}
          onOpenChange={setShowVoiceSettings}
        />
        
        {/* Voice Recorder Modal */}
        {showRecorder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl shadow-2xl border border-border/50 max-w-lg w-full mx-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isRecording ? 'bg-red-500/10' : 'bg-muted/50'}`}>
                    {isRecording ? (
                      <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                    ) : (
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {isRecording ? "Recording..." : recordedAudioUrl ? "Recording Complete" : "Voice Input"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isRecording ? "Speak clearly into your microphone" : 
                       recordedAudioUrl ? "Review and transcribe your recording" : 
                       "Click the microphone to start recording"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRecordingCancel}
                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Voice Recorder Component */}
              <div className="p-4">
                {visualizerType === 'react-voice-visualizer' ? (
                  <VoiceRecorder
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    onRecordingComplete={handleRecordingComplete}
                    onCancel={handleRecordingCancel}
                  />
                ) : (
                  <WaveSurferRecorder
                    isRecording={isRecording}
                    setIsRecording={setIsRecording}
                    onRecordingComplete={handleRecordingComplete}
                    onCancel={handleRecordingCancel}
                  />
                )}
              </div>

              {/* Transcription Section */}
              {(recordedAudioUrl || isTranscribing) && (
                <div className="border-t border-border/50 p-4 space-y-4">
                  {isTranscribing ? (
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <div>
                        <p className="text-sm font-medium">Transcribing audio...</p>
                        <p className="text-xs text-muted-foreground">Please wait while we convert your speech to text</p>
                      </div>
                    </div>
                  ) : transcriptionText ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-foreground">Transcribed Text:</h4>
                          {transcriptionResult && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {Math.round(transcriptionResult.confidence * 100)}% confidence
                              </span>
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  transcriptionResult.confidence > 0.9 ? 'bg-green-500' :
                                  transcriptionResult.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{transcriptionText}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAcceptTranscription}
                          className="flex-1 h-9 bg-primary hover:bg-primary/90"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Add to Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTranscriptionText("");
                            setTranscriptionResult(null);
                          }}
                          className="h-9 px-4"
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/30 rounded-lg border">
                        <h4 className="text-sm font-medium mb-2">Audio Recorded</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          Recording saved successfully. Enable auto-transcription in settings or manually transcribe.
                        </p>
                        {recordedAudioUrl && (
                          <audio controls className="w-full h-8">
                            <source src={recordedAudioUrl} type="audio/wav" />
                            Your browser does not support audio playback.
                          </audio>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            if (recordedAudioUrl) {
                              setIsTranscribing(true);
                              try {
                                const response = await fetch(recordedAudioUrl);
                                const blob = await response.blob();
                                await simulateTranscription(blob);
                              } catch (error) {
                                console.error("Error transcribing:", error);
                                setTranscriptionText("Error transcribing audio. Please try again.");
                              } finally {
                                setIsTranscribing(false);
                              }
                            }
                          }}
                          variant="outline"
                          className="flex-1 h-9"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Transcribe
                        </Button>
                        <Button
                          onClick={handleRecordingCancel}
                          variant="outline"
                          className="h-9 px-4"
                        >
                          Discard
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
