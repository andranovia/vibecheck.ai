/**
 * Transcription Service
 * 
 * This service handles audio transcription using the browser's built-in Web Speech API.
 * It provides real-time speech recognition without requiring external APIs.
 * 
 * Note: The Web Speech API is supported in most modern browsers but might have 
 * varying levels of support for different languages.
 */

export interface TranscriptionOptions {
  language?: string;
  enableProfanityFilter?: boolean;
  model?: 'general' | 'medical' | 'financial';
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  duration: number;
  language: string;
}

// Define types for the Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  
  constructor() {
    // Initialize the SpeechRecognition API with the correct prefix for browser compatibility
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
      }
    }
  }

  /**
   * Transcribe audio blob to text using the Web Speech API or fallback to audio processing
   */
  async transcribe(
    audioBlob: Blob, 
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    // First try to transcribe using Web Speech API for real-time audio
    if (this.recognition) {
      try {
        return await this.transcribeWithWebSpeech(audioBlob, options);
      } catch (error) {
        console.warn('Web Speech API transcription failed, falling back to audio processing', error);
        // Fall back to processing the audio blob
      }
    }
    
    // If Web Speech API is not available or fails, use audio processing method
    try {
      return await this.transcribeAudioBlob(audioBlob, options);
    } catch (error) {
      console.error('Audio transcription failed', error);
      // If all methods fail, return a basic result with error message
      return {
        text: "Transcription failed. Please try again or check microphone permissions.",
        confidence: 0,
        duration: 0,
        language: options.language || 'en-US'
      };
    }
  }

  /**
   * Transcribe using Web Speech API for real-time audio
   */
  private async transcribeWithWebSpeech(
    audioBlob: Blob,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        return reject(new Error('SpeechRecognition not supported in this browser'));
      }

      const recognition = this.recognition;
      recognition.lang = options.language || 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Create an audio element to play the blob
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      
      let finalText = '';
      let finalConfidence = 0;
      const startTime = Date.now();
      
      recognition.onresult = (event) => {
        const result = event.results[0][0];
        finalText = result.transcript;
        finalConfidence = result.confidence;
      };
      
      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      recognition.onend = () => {
        const duration = (Date.now() - startTime) / 1000;
        URL.revokeObjectURL(audio.src);
        
        if (!finalText) {
          reject(new Error('No transcription result obtained'));
        } else {
          resolve({
            text: finalText,
            confidence: finalConfidence,
            duration,
            language: options.language || 'en-US'
          });
        }
      };
      
      // Start recognition as the audio plays
      audio.onplay = () => {
        recognition.start();
      };
      
      audio.onended = () => {
        // Ensure recognition stops when audio ends
        if (recognition) {
          try {
            recognition.stop();
          } catch (e) {
            // Already stopped
          }
        }
      };
      
      // Play the audio
      audio.play().catch(err => {
        reject(new Error(`Error playing audio: ${err.message}`));
      });
    });
  }

  /**
   * Process audio blob directly when Web Speech API is not available
   * This is a more basic implementation that analyzes the audio waveform
   */
  private async transcribeAudioBlob(
    audioBlob: Blob,
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    // For browsers without SpeechRecognition, we use a more basic approach
    // In a real application, you might want to send this to a server for processing
    
    try {
      // Create an audio context to analyze the audio
      const audioContext = new AudioContext();
      const audioData = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      // Get basic audio metrics
      const duration = audioBuffer.duration;
      const channelData = audioBuffer.getChannelData(0);
      
      // Detect if there's actual speech in the audio (very basic)
      let hasSpeech = false;
      let peakLevel = 0;
      
      // Sample the audio data to detect speech
      const sampleSize = 1000;
      const sampleStep = Math.floor(channelData.length / sampleSize) || 1;
      
      for (let i = 0; i < channelData.length; i += sampleStep) {
        const level = Math.abs(channelData[i]);
        peakLevel = Math.max(peakLevel, level);
        if (level > 0.1) { // Threshold for speech
          hasSpeech = true;
        }
      }
      
      // If we detect speech but can't transcribe it, return a default message
      if (hasSpeech) {
        return {
          text: "Speech detected but couldn't be transcribed. Try using a browser that supports the Web Speech API.",
          confidence: 0.5,
          duration,
          language: options.language || 'en-US'
        };
      } else {
        return {
          text: "No speech detected in the recording.",
          confidence: 0.8,
          duration,
          language: options.language || 'en-US'
        };
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      // Fallback for older browsers
      return {
        text: "Speech recognition not fully supported in this browser. Try Chrome or Edge for best results.",
        confidence: 0.3,
        duration: audioBlob.size / 16000, // Rough estimate
        language: options.language || 'en-US'
      };
    }
  }

  /**
   * Create a browser-based transcription service instance
   * This is a factory method that you can use to create a new instance with specific settings
   */
  static createBrowserTranscriptionService(): TranscriptionService {
    return new TranscriptionService();
  }
  
  /**
   * Check if speech recognition is supported in the current browser
   */
  static isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && 
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  
  /**
   * Get the supported languages for speech recognition
   * Note: This is a basic implementation, browser support varies
   */
  static getSupportedLanguages(): string[] {
    return [
      'en-US', 'en-GB', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 
      'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW', 'ru-RU'
    ];
  }

  /**
   * Check if transcription service is available
   */
  isAvailable(): boolean {
    // Check if speech recognition is supported
    return TranscriptionService.isSpeechRecognitionSupported();
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): Array<{code: string, name: string}> {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-PT', name: 'Portuguese' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
    ];
  }
}

// Export a default instance
export const transcriptionService = new TranscriptionService();
