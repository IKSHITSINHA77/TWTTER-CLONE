// src/hooks/useAudioLifecycle.ts
import { useEffect, useRef } from 'react';

export const useAudioLifecycle = () => {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Pause, reset source, and force garbage collection cleanup when component unmounts
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current.src = '';
        activeAudioRef.current = null;
      }
    };
  }, []);

  return { activeAudioRef };
};