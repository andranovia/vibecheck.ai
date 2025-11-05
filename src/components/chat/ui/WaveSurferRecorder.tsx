"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import { Mic } from "lucide-react";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";

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
  const [recordingDuration, setRecordingDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
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

  return (
    <div className="wavesurfer-recorder-container">
      {(showVisualizer) ? (
        <>
         
          <div className="flex flex-col gap-3">
            <div className="visualizer-container">
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
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center gap-0">
          <div className="p-4 rounded-full bg-primary/10 mb-4" onClick={() => {
            setIsRecording(true);
            setShowVisualizer(true);
            recorderControls.startRecording();
          }}>
            <Mic className="h-8 w-8  text-primary " />
          </div>
          <p className="text-xs text-muted-foreground">Click the microphone button to start recording your voice message</p>
        </div>
      )
      }
    </div >
  );
}