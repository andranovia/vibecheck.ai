"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { Button } from "@/components/ui/button";
import { Mic, Play, Pause, Save, Trash2 } from "lucide-react";

interface WaveSurferRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
}

export function WaveSurferRecorder({
  onRecordingComplete,
  onCancel,
  isRecording,
  setIsRecording,
}: WaveSurferRecorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const recordPluginRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance with customized visualization
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#a78bfa', // Light purple
      progressColor: '#7c3aed', // Darker purple
      height: 60,
      cursorWidth: 0,
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      normalize: true,
      minPxPerSec: 50,
      fillParent: true,
      interact: true,
    });

    // Initialize record plugin
    const record = wavesurfer.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: true,
      })
    );

    // Set up record end handler
    record.on('record-end', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      wavesurfer.load(url);

      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });

    wavesurferRef.current = wavesurfer;
    recordPluginRef.current = record;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      wavesurfer.destroy();
    };
  }, []);

  // Handle recording state changes
  useEffect(() => {
    const record = recordPluginRef.current;
    if (!record) return;

    if (isRecording && !record.isRecording() && !record.isPaused()) {
      startRecordingProcess();
    } else if (!isRecording && (record.isRecording() || record.isPaused())) {
      record.stopRecording();
      setIsPaused(false);
    }
  }, [isRecording]);

  const startRecordingProcess = async () => {
    const record = recordPluginRef.current;
    if (!record) return;

    try {
      // Get available audio devices
      const devices = await RecordPlugin.getAvailableAudioDevices();
      if (devices.length === 0) {
        throw new Error("No audio devices found");
      }

      // Start recording with the first available device
      await record.startRecording({
        deviceId: devices[0].deviceId,
        // Set audio parameters for better quality
        sampleRate: 44100,
        mimeType: 'audio/webm',
      });
      setShowVisualizer(true);
      setRecordingTime(0);
      setIsPaused(false);

      // Start a timer to track recording time
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      onCancel();
    }
  };

  const handleTogglePause = () => {
    const record = recordPluginRef.current;
    if (!record) return;

    if (record.isRecording()) {
      record.pauseRecording();
      setIsPaused(true);

      // Pause the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else if (record.isPaused()) {
      record.resumeRecording();
      setIsPaused(false);

      // Resume the timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const handleSaveRecording = () => {
    if (recordedUrl) {
      // Fetch the blob from the URL
      fetch(recordedUrl)
        .then(response => response.blob())
        .then(blob => {
          onRecordingComplete(blob);
          resetRecording();
        })
        .catch(error => {
          console.error("Error fetching blob:", error);
        });
    }
  };

  const handleCancelRecording = () => {
    resetRecording();
    onCancel();
  };

  const resetRecording = () => {
    setIsRecording(false);
    setShowVisualizer(false);
    setRecordingTime(0);
    setIsPaused(false);
    setRecordedUrl(null);

    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reset wavesurfer
    if (wavesurferRef.current) {
      wavesurferRef.current.empty();
    }
  };

  const formatTime = (seconds: number) => {
    // Ensure we have a valid number
    seconds = Math.max(0, seconds || 0);
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      try {
        // Make sure the audio is loaded before playing
        if (recordedUrl && wavesurferRef.current.getDuration() === 0) {
          // Load the audio and then play
          wavesurferRef.current.load(recordedUrl);

          // Add an event listener to play once loaded
          const onReady = () => {
            wavesurferRef.current?.play();
            wavesurferRef.current?.un('ready', onReady); // Remove event listener
          };

          wavesurferRef.current.on('ready', onReady);
        } else {
          // Just toggle play/pause if already loaded
          if (wavesurferRef.current.isPlaying()) {
            wavesurferRef.current.pause();
          } else {
            wavesurferRef.current.play();
          }
        }
      } catch (error) {
        console.error("Error playing/pausing audio:", error);
      }
    }
  };

  return (
    <div className="wavesurfer-recorder-container">
      {(showVisualizer) ? (
        <div className="flex flex-col gap-3">
          <div className="visualizer-container p-4 bg-muted/30 rounded-lg border border-border/50">
            <div ref={containerRef} className="w-full"></div>
            <div className="flex justify-between items-center mt-3">
              <div className="recording-time text-sm font-mono">
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-500 font-medium">{formatTime(recordingTime)}</span>
                  </span>
                ) : recordedUrl ? (
                  <span className="text-muted-foreground">{formatTime(recordingTime)}</span>
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
                      onClick={handleTogglePause}
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
                      onClick={() => setIsRecording(false)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : recordedUrl ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:bg-muted/70"
                      onClick={handlePlayPause}
                    >
                      <Play className="h-4 w-4 text-primary" />
                    </Button>
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
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-0">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Mic className="h-8 w-8  text-primary " />
          </div>
          <p className="text-xs text-muted-foreground mb-4">Click the microphone button to start recording your voice message</p>
        </div>
      )}
    </div>
  );
}