'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause } from 'lucide-react';

export default function TextToSpeech({ text, title }: { text: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
    
    // Cleanup when unmounting
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayPause = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      // Start fresh
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/<[^>]+>/g, ''); // Strip HTML if any
      const fullText = `${title}. ${cleanText}`;
      
      // We don't chunk it manually here, but we apply a keep-alive interval
      // because Chrome on Windows has a bug where it stops playing after 15 seconds.
      const utterance = new SpeechSynthesisUtterance(fullText);
      utteranceRef.current = utterance;
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        clearInterval(timer);
      };
      
      utterance.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        setIsPlaying(false);
        setIsPaused(false);
        clearInterval(timer);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);

      // Windows Chrome Keep-Alive Hack
      const timer = setInterval(() => {
        if (!window.speechSynthesis.paused && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking) {
          clearInterval(timer);
        }
      }, 14000);
    }
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2 mb-6">
      <button 
        onClick={handlePlayPause}
        className="flex items-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent font-bold px-4 py-2 rounded-full transition-colors"
      >
        {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} />}
        <span>{isPlaying && !isPaused ? 'Pause' : 'Listen to Article'}</span>
      </button>
      
      {isPlaying && (
        <button 
          onClick={handleStop}
          className="flex items-center justify-center bg-foreground/10 hover:bg-foreground/20 text-foreground p-2 rounded-full transition-colors"
          aria-label="Stop playback"
        >
          <Square size={16} className="fill-current" />
        </button>
      )}
    </div>
  );
}
