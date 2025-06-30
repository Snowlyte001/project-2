export class VoiceService {
  private static readonly ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
  private static readonly ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella - calm, nurturing voice
  private static recognition: SpeechRecognition | null = null;
  private static synthesis = window.speechSynthesis;

  // Initialize speech recognition
  static initializeSpeechRecognition(): SpeechRecognition | null {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    return this.recognition;
  }

  // Start listening for voice input
  static startListening(
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) {
      this.recognition = this.initializeSpeechRecognition();
    }

    if (!this.recognition) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.start();
  }

  // Stop listening
  static stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  // Generate speech using ElevenLabs (premium) or fallback to browser TTS
  static async generateSpeech(text: string): Promise<string | null> {
    if (this.ELEVENLABS_API_KEY) {
      try {
        return await this.generateElevenLabsSpeech(text);
      } catch (error) {
        console.error('ElevenLabs TTS failed, falling back to browser TTS:', error);
      }
    }

    // Fallback to browser TTS
    this.speakWithBrowserTTS(text);
    return null;
  }

  // ElevenLabs TTS integration
  private static async generateElevenLabsSpeech(text: string): Promise<string> {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: this.cleanTextForSpeech(text),
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.3,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  }

  // Browser TTS fallback
  private static speakWithBrowserTTS(text: string): void {
    this.synthesis.cancel(); // Stop any ongoing speech
    
    const utterance = new SpeechSynthesisUtterance(this.cleanTextForSpeech(text));
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a pleasant voice
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('zira')
    );
    
    if (preferredVoice) utterance.voice = preferredVoice;

    this.synthesis.speak(utterance);
  }

  // Clean text for better speech synthesis
  private static cleanTextForSpeech(text: string): string {
    return text
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\n\n/g, '. ') // Replace double newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/•/g, '') // Remove bullet points
      .replace(/🔍|🧠|📚|🌐|⚠️|🚨|😴|🍼|🎭|🌱|🛡️|🏥|💝|🚀|👶|🎯|✨|💡|🔧|📱|🎓|👨‍👩‍👧‍👦/g, '') // Remove emojis
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Check if ElevenLabs is configured
  static isElevenLabsConfigured(): boolean {
    return !!this.ELEVENLABS_API_KEY;
  }

  // Check if speech recognition is supported
  static isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}