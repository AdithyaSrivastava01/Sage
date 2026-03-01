// useAvatar hook — Web Speech Synthesis TTS (replaces HeyGen LiveAvatar)
// Uses the browser's built-in SpeechSynthesis API. No paid API required.
// Maintains the same interface so useSession.ts doesn't need changes.

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AvatarStatus } from "@/types/session";

export function useAvatar() {
  const [status, setStatus] = useState<AvatarStatus>("disconnected");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mutedRef = useRef(false);

  // Cancel any in-progress speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const startSession = useCallback(async () => {
    setStatus("connected");
  }, []);

  const endSession = useCallback(async () => {
    window.speechSynthesis?.cancel();
    setStatus("disconnected");
  }, []);

  // speak(text) — synthesize speech using Web Speech API
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim() || mutedRef.current) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    return new Promise((resolve) => {
      window.speechSynthesis.cancel(); // stop any current speech

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Pick a natural-sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Samantha") ||
              v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Premium") ||
              !v.localService),
        ) ??
        voices.find((v) => v.lang.startsWith("en")) ??
        voices[0];

      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = mutedRef.current ? 0 : 1;

      setStatus("speaking");

      utterance.onend = () => {
        setStatus("connected");
        resolve();
      };
      utterance.onerror = () => {
        setStatus("connected");
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // speakAudio — no-op (was ElevenLabs PCM; we use speak() instead)
  const speakAudio = useCallback(async (_pcmBase64: string): Promise<void> => {
    // Audio streaming replaced by Web Speech Synthesis via speak()
  }, []);

  const interrupt = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    setStatus("connected");
  }, []);

  // attach — no-op (was HeyGen video element; no avatar video now)
  const attach = useCallback((_element: HTMLMediaElement) => {}, []);

  const muteAvatarAudio = useCallback(() => {
    mutedRef.current = true;
    if (utteranceRef.current && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
    }
  }, []);

  const unmuteAvatarAudio = useCallback(() => {
    mutedRef.current = false;
    if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  return {
    status,
    startSession,
    endSession,
    speak,
    speakAudio,
    interrupt,
    attach,
    muteAvatarAudio,
    unmuteAvatarAudio,
  };
}
