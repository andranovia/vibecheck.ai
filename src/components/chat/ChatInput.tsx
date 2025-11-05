"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Send,
  Paperclip,
  Settings,
} from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  messagesLength: number;
  onOpenSettings?: () => void;
  onModelChange?: (model: string) => void;
}

import { WaveSurferRecorder } from "./ui/WaveSurferRecorder";
import { useVoiceStore } from "@/lib/voiceStore";
import { transcriptionService, TranscriptionResult } from "@/lib/transcriptionService";
import ModelSelection from "./ui/ModelSelection";

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  onOpenSettings,
  onModelChange,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMode, setSelectedMode] = useState("chat");
  const [showRecorder, setShowRecorder] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { autoTranscribe, transcriptionLanguage, enableProfanityFilter } = useVoiceStore();

  const handleVoiceToggle = () => {
    if (selectedMode === "voice") {
      setShowRecorder(false);
    } else {
      setShowRecorder(true);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsRecording(false);

    // Make sure we have a valid blob with actual audio data
    if (!blob || blob.size === 0) {
      console.error("Empty audio blob received");
      setTranscriptionText("No audio data recorded. Please try again.");
      return;
    }

    // Create URL for audio playback
    const audioUrl = URL.createObjectURL(blob);
    setRecordedAudioUrl(audioUrl);

    // Automatically transcribe if enabled in settings
    if (autoTranscribe) {
      await transcribeAudio(blob);
    }
  };

  const transcribeAudio = async (blob: Blob): Promise<void> => {
    try {
      setIsTranscribing(true);

      // Use our improved transcription service
      const result = await transcriptionService.transcribe(blob, {
        language: transcriptionLanguage,
        enableProfanityFilter,
      });

      setTranscriptionResult(result);
      setTranscriptionText(result.text);

      // If confidence is very low, show a warning
      if (result.confidence < 0.4) {
        console.warn("Low confidence transcription result:", result);
      }
    } catch (error) {
      console.error("Transcription failed:", error);
      setTranscriptionText("Transcription failed. Please try again or check microphone permissions.");
    } finally {
      setIsTranscribing(false);
    }
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
      <div className=" bottom-0 z-50 ">
        <div className="max-w-4xl mx-auto p-4">
          {/* Main Input Container */}
          <div className="relative bg-background rounded-2xl border border-border/60 group">
            {/* Model Selector Bar */}
            <ModelSelection onModelChange={onModelChange} selectedMode={selectedMode} setSelectedMode={setSelectedMode} handleVoiceToggle={handleVoiceToggle} />

            {/* Input Area */}
            <div className="p-4">
              <div className="flex gap-3 items-end">
                {/* Left Actions */}
                {!showRecorder ? (<div className="flex gap-1">
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
                </div>) : null}

                {/* Text Input */}
                <div className="flex-1 relative">
                  {showRecorder ? (
                    <div className="z-50 flex items-center justify-center">
                      <div className=" max-w-lg w-full mx-auto overflow-hidden">

                        {/* Voice Recorder Component */}
                        <div className="p-4">
                          <WaveSurferRecorder
                            isRecording={isRecording}
                            setIsRecording={setIsRecording}
                            onRecordingComplete={handleRecordingComplete}
                            onCancel={handleRecordingCancel}
                          />
                        </div>

                      </div>
                    </div>
                  ) : <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message your vibe...`}
                    className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent p-3 pr-12 focus:ring-0 focus:outline-none text-base placeholder:text-muted-foreground/60"
                    onKeyDown={handleKeyDown}
                  />}


                </div>

                {/* Send Button */}
                {!showRecorder ? (
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
                  </Tooltip>) : null}
              </div>

              {/* Bottom Actions Bar */}
              <div className={`flex items-center justify-between mt-4 pt-3  border-t border-border/30`}>
                <div className="px-2 flex items-center gap-4">
                  <p className="text-xs text-muted-foreground">
                    {!showRecorder ? "Press Enter to send • Shift+Enter for new line" : "Record and voice your vibe"}
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors`}
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
              const currentText = input.trim();
              const prefix = currentText ? `${currentText} ` : '';
              setInput(`${prefix}[Attached: ${file.name}]`);

              // Clear the file input for future uploads
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }
          }}
        />

      </div>
    </TooltipProvider>
  );
}
