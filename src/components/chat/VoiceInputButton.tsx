'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            alert(`Voice input error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={toggleListening}
      variant="ghost"
      size="icon"
      disabled={disabled}
      className={cn(
        'h-12 w-12 rounded-full flex-shrink-0 border transition-all duration-300',
        isListening
          ? 'text-blue-300 bg-blue-500/30 border-blue-400 animate-pulse scale-110 shadow-lg shadow-blue-500/50'
          : 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 border-blue-500/30'
      )}
      title={isListening ? '🎤 Listening... (click to stop)' : '🎤 Voice Active - Click to speak'}
    >
      {isListening ? (
        <div className="relative">
          <Mic className="w-5 h-5" />
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
}

