"use client";

import { useEffect, useState } from "react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, Save, Trash2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

export function VoiceRecorder({
  onRecordingComplete,
  onCancel,
  isRecording,
  setIsRecording,
}: VoiceRecorderProps) {
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Initialize the recorder controls using the hook
  const recorderControls = useVoiceVisualizer({
    onStartRecording: () => {
      setShowVisualizer(true);
      setRecordingDuration(0);
    },
    onStopRecording: () => {
      // Keep visualizer visible after recording stops
    },
    onPausedRecording: () => {
      setIsPaused(true);
    },
    onResumedRecording: () => {
      setIsPaused(false);
    },
  });

  const {
    recordedBlob,
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingTime,
    clearCanvas,
    error,
  } = recorderControls;

  // Sync external recording state with internal state
  useEffect(() => {
    if (isRecording && !showVisualizer) {
      startRecording();
    } else if (!isRecording && showVisualizer && !recordedBlob) {
      stopRecording();
    }
  }, [isRecording, showVisualizer, recordedBlob, startRecording, stopRecording]);

  // Handle recording errors
  useEffect(() => {
    if (error) {
      console.error("Recording error:", error);
      
      // Create a user-friendly error message
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Microphone access denied. Please enable microphone permissions in your browser settings.'
        : error.name === 'NotFoundError'
        ? 'No microphone found. Please connect a microphone and try again.'
        : `Unable to access microphone: ${error.message || "Please check your microphone permissions"}`;
      
      // Show error message in a non-blocking way
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(220,38,38,0.9);color:white;padding:12px 16px;border-radius:8px;z-index:10000;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
      errorDiv.innerHTML = errorMessage;
      document.body.appendChild(errorDiv);
      
      // Remove after 5 seconds
      setTimeout(() => {
        errorDiv.style.opacity = '0';
        errorDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => document.body.removeChild(errorDiv), 500);
      }, 5000);
      
      setIsRecording(false);
      onCancel();
    }
  }, [error, onCancel, setIsRecording]);

  // Handle recorded blob
  useEffect(() => {
    if (recordedBlob) {
      console.log("Recorded blob:", recordedBlob);
    }
  }, [recordedBlob]);

  // Update recording duration
  useEffect(() => {
    if (recordingTime !== undefined) {
      setRecordingDuration(recordingTime);
    }
  }, [recordingTime]);

  const handleStartRecording = () => {
    if (!showVisualizer) {
      setShowVisualizer(true);
    }
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSaveRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      setShowVisualizer(false);
      clearCanvas();
    }
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
    setShowVisualizer(false);
    clearCanvas();
    onCancel();
  };

  // Auto-start visualizer when recording begins
  useEffect(() => {
    if (isRecording && !showVisualizer) {
      setShowVisualizer(true);
    }
    
    // Update canvas animation frame rate when recording
    if (isRecording) {
      const visualizerElement = document.querySelector('.voice-visualizer canvas');
      if (visualizerElement instanceof HTMLCanvasElement) {
        // Force higher frame rate update for smoother visualization
        visualizerElement.style.animation = 'pulse 0.5s infinite';
      }
    }
  }, [isRecording, showVisualizer]);
  
  // Add dynamic styling for smoother animations
  useEffect(() => {
    // Add keyframes for animation if not already added
    if (!document.querySelector('#voice-recorder-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'voice-recorder-styles';
      styleTag.textContent = `
        @keyframes pulse {
          0% { opacity: 0.95; }
          50% { opacity: 1; }
          100% { opacity: 0.95; }
        }
        .voice-visualizer canvas {
          transition: all 0.2s ease;
        }
        .recording-indicator {
          animation: pulse 1.2s infinite;
        }
      `;
      document.head.appendChild(styleTag);
    }
    
    return () => {
      // Clean up on unmount
      const styleTag = document.querySelector('#voice-recorder-styles');
      if (styleTag) {
        document.head.removeChild(styleTag);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="voice-recorder-container">
      {(showVisualizer || isRecording || recordedBlob) ? (
        <div className="flex flex-col gap-3">
          <div className="visualizer-container p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="voice-visualizer">
              <VoiceVisualizer
                controls={recorderControls}
                height={80}
                width="100%"
                backgroundColor="transparent"
                mainBarColor="#7c3aed" // Purple color for primary bars
                secondaryBarColor="#a78bfa" // Lighter purple for secondary bars
                barWidth={2}
                gap={1}
                rounded={5}
                isControlPanelShown={false}
                isDefaultUIShown={false}
                animateCurrentPick={true}
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="recording-time text-sm font-mono">
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse recording-indicator"></span>
                    <span className="text-red-500 font-medium">{formatTime(recordingDuration)}</span>
                  </span>
                ) : recordedBlob ? (
                  <span className="text-muted-foreground">{formatTime(recordingDuration)}</span>
                ) : (
                  <span className="text-muted-foreground">00:00</span>
                )}
              </div>
              <div className="flex gap-2">
                {isRecording ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-muted/70"
                      onClick={togglePauseResume}
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4 text-primary" />
                      ) : (
                        <Pause className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                      onClick={handleStopRecording}
                    >
                      <MicOff className="h-4 w-4" />
                    </Button>
                  </>
                ) : recordedBlob ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500"
                      onClick={handleCancelRecording}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-green-500/10 hover:text-green-500"
                      onClick={handleSaveRecording}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={handleStartRecording}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 rounded-full bg-muted/30 mb-4">
            <Mic className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-sm mb-2">Ready to Record</h3>
          <p className="text-xs text-muted-foreground mb-4">Click the microphone button to start recording your voice message</p>
          <Button
            onClick={handleStartRecording}
            className="h-10 px-6"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        </div>
      )}
    </div>
  );
}