// Web Speech Recognition ASR client — browser-native, no paid API
// Implements the same ASRClient interface as the previous Deepgram client.
// Uses the browser's built-in SpeechRecognition API (Chrome/Edge/Safari).
// No SDK types leak outside this module.

export interface ASRClient {
  /** Connect and acquire mic permission. */
  connect(): Promise<void>;
  /** Disconnect and release resources. */
  disconnect(): void;
  /** Start streaming mic audio (push-to-talk: Space down). */
  startListening(): void;
  /** Stop streaming and finalize (push-to-talk: Space up). */
  stopListening(): void;
  /** Register callback for transcription events. */
  onTranscript(cb: (text: string, isFinal: boolean) => void): void;
}

// Browser-only types — SpeechRecognition lives in the DOM but tsconfig
// compiles server-side files too. Use explicit interface to keep types safe.
interface SR {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: ((event: any) => void) | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export function createASRClient(): ASRClient {
  const transcriptCallbacks: ((text: string, isFinal: boolean) => void)[] = [];
  let recognition: SR | null = null;
  let isListening = false;
  let connected = false;

  function notifyTranscript(text: string, isFinal: boolean) {
    transcriptCallbacks.forEach((cb) => cb(text, isFinal));
  }

  function createRecognition(): SR | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SRClass = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SRClass) {
      console.warn(
        "[WebSpeechASR] SpeechRecognition not supported in this browser",
      );
      return null;
    }

    const rec: SR = new SRClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        const isFinal = result.isFinal;
        if (transcript) {
          console.log(
            `[WebSpeechASR] ${isFinal ? "FINAL" : "interim"}: "${transcript}"`,
          );
          notifyTranscript(transcript, isFinal);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        console.error("[WebSpeechASR] Error:", event.error);
      }
    };

    rec.onend = () => {
      console.log("[WebSpeechASR] Recognition ended");
      // Auto-restart if we're still supposed to be listening
      if (isListening && connected) {
        try {
          rec.start();
        } catch {
          /* ignore if already started */
        }
      }
    };

    return rec;
  }

  return {
    async connect() {
      // Request mic permission upfront
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error("Microphone permission denied");
      }
      connected = true;
      console.log("[WebSpeechASR] Connected — mic ready");
    },

    disconnect() {
      isListening = false;
      connected = false;
      if (recognition) {
        recognition.abort();
        recognition = null;
      }
      console.log("[WebSpeechASR] Disconnected");
    },

    startListening() {
      if (isListening) return;
      isListening = true;

      if (!recognition) {
        recognition = createRecognition();
      }

      if (recognition) {
        try {
          recognition.start();
          console.log("[WebSpeechASR] Listening started");
        } catch (e) {
          console.warn("[WebSpeechASR] Could not start recognition:", e);
        }
      }
    },

    stopListening() {
      if (!isListening) return;
      isListening = false;

      if (recognition) {
        try {
          recognition.stop();
          console.log("[WebSpeechASR] Listening stopped");
        } catch {
          /* ignore */
        }
      }
    },

    onTranscript(cb) {
      transcriptCallbacks.push(cb);
    },
  };
}
