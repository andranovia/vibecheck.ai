import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type VisualizerType = 'wavesurfer';

interface VoiceStoreState {
  // Visualizer settings
  visualizerType: VisualizerType;
  setVisualizerType: (type: VisualizerType) => void;
  
  // Voice recognition settings
  autoTranscribe: boolean;
  setAutoTranscribe: (value: boolean) => void;
  
  // Recording settings
  maxRecordingDuration: number; // in seconds
  setMaxRecordingDuration: (duration: number) => void;
  
  // UI settings
  showWaveformDuringRecording: boolean;
  setShowWaveformDuringRecording: (value: boolean) => void;
  
  // Theme settings
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  
  // Transcription settings
  transcriptionLanguage: string;
  setTranscriptionLanguage: (language: string) => void;
  enableProfanityFilter: boolean;
  setEnableProfanityFilter: (value: boolean) => void;
}

export const useVoiceStore = create<VoiceStoreState>()(
  persist(
    (set) => ({
      // Default settings
      visualizerType: 'wavesurfer',
      setVisualizerType: (type) => set({ visualizerType: type }),
      
      autoTranscribe: false,
      setAutoTranscribe: (value) => set({ autoTranscribe: value }),
      
      maxRecordingDuration: 300, // 5 minutes
      setMaxRecordingDuration: (duration) => set({ maxRecordingDuration: duration }),
      
      showWaveformDuringRecording: true,
      setShowWaveformDuringRecording: (value) => set({ showWaveformDuringRecording: value }),
      
      primaryColor: '#7c3aed', // Purple
      secondaryColor: '#a78bfa', // Light purple
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setSecondaryColor: (color) => set({ secondaryColor: color }),
      
      transcriptionLanguage: 'en-US',
      setTranscriptionLanguage: (language) => set({ transcriptionLanguage: language }),
      
      enableProfanityFilter: false,
      setEnableProfanityFilter: (value) => set({ enableProfanityFilter: value }),
    }),
    {
      name: 'voice-settings',
    }
  )
);