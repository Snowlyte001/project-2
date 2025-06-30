import React, { useState } from 'react';
import { Video, Play, Loader2, AlertCircle } from 'lucide-react';
import { VirtualPediatricianService } from '../services/virtualPediatrician';

interface VirtualPediatricianProps {
  message: string;
  urgency: 'low' | 'medium' | 'high';
  onVideoGenerated: (videoUrl: string) => void;
}

export function VirtualPediatrician({ message, urgency, onVideoGenerated }: VirtualPediatricianProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVideoResponse = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await VirtualPediatricianService.generateVideoResponse(message, urgency);
      
      if (result) {
        setVideoUrl(result.videoUrl);
        onVideoGenerated(result.videoUrl);
      } else {
        setError('Video generation not available. Please check your Tavus configuration.');
      }
    } catch (error) {
      setError('Failed to generate video response');
    } finally {
      setIsGenerating(false);
    }
  };

  const isTavusConfigured = VirtualPediatricianService.isTavusConfigured();

  if (!isTavusConfigured) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
              🩺 Virtual Pediatrician Available
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Add your Tavus API key to enable AI-generated video responses from our virtual pediatrician for medical guidance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Virtual Pediatrician
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get personalized video guidance from our AI pediatrician
            </p>
          </div>
        </div>

        <button
          onClick={generateVideoResponse}
          disabled={isGenerating}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
            ${urgency === 'high' 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105 active:scale-95'}
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Get Video Guidance</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="mt-4">
          <iframe
            src={videoUrl}
            className="w-full h-64 rounded-lg border border-gray-200 dark:border-gray-700"
            allow="camera; microphone"
            title="Virtual Pediatrician Video Response"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 You can interact with the virtual pediatrician in real-time through this video interface
          </p>
        </div>
      )}
    </div>
  );
}