import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { VoiceService } from '../services/voiceService';

interface VoiceAssistantProps {
  onVoiceInput: (text: string) => void;
  onVoiceResponse: (audioUrl: string) => void;
  isProcessing: boolean;
}

export function VoiceAssistant({ onVoiceInput, onVoiceResponse, isProcessing }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startListening = () => {
    setError(null);
    setIsListening(true);

    VoiceService.startListening(
      (transcript) => {
        setIsListening(false);
        onVoiceInput(transcript);
      },
      (error) => {
        setIsListening(false);
        setError(error);
      }
    );
  };

  const stopListening = () => {
    VoiceService.stopListening();
    setIsListening(false);
  };

  const generateVoiceResponse = async (text: string) => {
    setIsGeneratingAudio(true);
    setError(null);

    try {
      const audioUrl = await VoiceService.generateSpeech(text);
      if (audioUrl) {
        onVoiceResponse(audioUrl);
        // Auto-play the response
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (error) {
      setError('Failed to generate voice response');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const isSpeechSupported = VoiceService.isSpeechRecognitionSupported();
  const isElevenLabsConfigured = VoiceService.isElevenLabsConfigured();

  return (
    <div className="flex items-center gap-3">
      {/* Voice Input Button */}
      {isSpeechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`
            p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Voice Response Button */}
      <button
        onClick={() => {
          const lastMessage = document.querySelector('[data-last-ai-message]')?.textContent;
          if (lastMessage) {
            generateVoiceResponse(lastMessage);
          }
        }}
        disabled={isGeneratingAudio || isProcessing}
        className={`
          p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95
          bg-purple-500 hover:bg-purple-600 text-white
          ${(isGeneratingAudio || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={isElevenLabsConfigured ? 'Generate high-quality voice response' : 'Generate voice response'}
      >
        {isGeneratingAudio ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Audio Element */}
      <audio ref={audioRef} className="hidden" />

      {/* Status Indicators */}
      <div className="flex flex-col text-xs">
        {isListening && (
          <span className="text-red-600 dark:text-red-400 animate-pulse">
            🎤 Listening...
          </span>
        )}
        {isGeneratingAudio && (
          <span className="text-purple-600 dark:text-purple-400">
            🔊 Generating voice...
          </span>
        )}
        {error && (
          <span className="text-red-600 dark:text-red-400">
            ⚠️ {error}
          </span>
        )}
        {isElevenLabsConfigured && (
          <span className="text-green-600 dark:text-green-400">
            ✨ Premium voice
          </span>
        )}
      </div>
    </div>
  );
}