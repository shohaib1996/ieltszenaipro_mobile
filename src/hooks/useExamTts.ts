import { useCallback, useRef, useState } from 'react';
import * as Speech from 'expo-speech';

/**
 * Native TTS (expo-speech) is far more reliable than the browser's speechSynthesis
 * (no async voice loading, no utterance GC, no cancel()+speak() race) - this hook
 * mirrors the web app's useTextToSpeech contract without needing those workarounds.
 */
export function useExamTts() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) Speech.stop();
      return next;
    });
  }, []);

  const speak = useCallback((text: string) => {
    if (isMutedRef.current || !text.trim()) return;
    Speech.speak(text, {
      language: 'en-US',
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, []);

  const cancel = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, isMuted, speak, cancel, toggleMute };
}
