/**
 * Transcription Service
 * 
 * This service handles audio transcription. Currently implemented with a mock,
 * but can be easily replaced with real transcription services like:
 * - OpenAI Whisper API
 * - Google Speech-to-Text
 * - Azure Speech Services
 * - Assembly AI
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

export class TranscriptionService {
  private apiKey?: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio blob to text
   */
  async transcribe(
    audioBlob: Blob, 
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    
    // Mock implementation - replace with real API call
    return this.mockTranscription(audioBlob, options);
    
    // Example implementation with OpenAI Whisper:
    // return this.transcribeWithWhisper(audioBlob, options);
  }

  /**
   * Mock transcription for development/testing
   */
  private async mockTranscription(
    audioBlob: Blob, 
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const mockTexts = [
      "Hello, this is a test voice message. I hope the transcription is working correctly.",
      "Testing the voice recording feature. This should appear as text in the chat input.",
      "Voice to text conversion is working. I can speak and it gets converted to text automatically.",
      "This is a sample transcription of your voice recording. In a real implementation, this would be actual speech-to-text conversion.",
      "The audio quality seems good. The transcription service is processing the recording and converting it to readable text.",
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    return {
      text: randomText,
      confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
      duration: audioBlob.size / 1000, // Rough estimate
      language: options.language || 'en-US'
    };
  }

  /**
   * Example implementation with OpenAI Whisper API
   * Uncomment and configure when ready to use real transcription
   */
  /*
  private async transcribeWithWhisper(
    audioBlob: Blob, 
    options: TranscriptionOptions
  ): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new Error('API key required for Whisper transcription');
    }

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('language', options.language || 'en');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      text: result.text,
      confidence: 0.95, // Whisper doesn't provide confidence scores
      duration: result.duration || 0,
      language: options.language || 'en-US'
    };
  }
  */

  /**
   * Check if transcription service is available
   */
  isAvailable(): boolean {
    // For mock implementation, always available
    return true;
    
    // For real API, check if API key is configured
    // return !!this.apiKey;
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
