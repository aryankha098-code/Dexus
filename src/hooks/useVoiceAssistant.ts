import { useCallback, useEffect, useRef, useState } from "react";
import { extractPartsText } from "../lib/extractReplyText";
import { splitCompleteSentences } from "../lib/splitCompleteSentences";
import { explainEmptyReply } from "../lib/explainEmptyReply";
import { popLine } from "../lib/popLine";

export type AssistantState = "idle" | "listening" | "thinking" | "speaking" | "error";

interface UseVoiceAssistant {
  state: AssistantState;
  transcript: string;
  reply: string;
  errorMessage: string | null;
  supported: boolean;
  muted: boolean;
  toggle: () => void;
  toggleMuted: () => void;
  reset: () => void;
}

// Minimal shape of the Web Speech API's SpeechRecognition — not in
// standard TS lib.dom yet, so we declare just what we use.
interface SpeechRecognitionResultLike {
  transcript: string;
}
interface SpeechRecognitionEventLike extends Event {
  results: { 0: { 0: SpeechRecognitionResultLike }; length: number };
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const SYSTEM_PROMPT =
  "You are EchoMind, a warm, concise voice assistant. Keep replies to 1-3 short sentences — they will be read aloud.";

// ponytail: hardcoded to the current free-tier flash model. Google
// renames/deprecates these periodically — if you get a 404 "model not
// found", check https://ai.google.dev/gemini-api/docs/models for the
// current name and swap it in here.
// Deliberately pinned to a specific stable model instead of the
// "-latest" alias — gemini-flash-latest currently resolves to a
// "thinking" model (gemini-3.6-flash) that spends ~165-175 tokens on
// invisible internal reasoning before writing any visible text, which
// adds real delay before speech can start and nothing here can work
// around. gemini-2.0-flash is a non-thinking model: no reasoning tax,
// so replies start faster. If Google retires this model, you'll get a
// 404 — check https://ai.google.dev/gemini-api/docs/models and swap in
// whatever the current non-thinking flash model is called.
// Confirmed via a direct GET to /v1beta/models?key=... against this
// project's own key (2026-08-13) — gemini-2.0-flash has been retired
// ("no longer available", 404). Nearly every currently listed text
// model has "thinking": true, including the lite variants — so a
// non-thinking model isn't an option anymore; that's just how Gemini
// works now. Picked the lite tier instead, since smaller models
// typically get more generous free-tier rate limits than full flash
// (the previous gemini-3.6-flash was capped at 5 requests/minute and
// 20/day on this project's free tier, which we blew through testing).
// If this 404s too, re-run the model-list check — Google renames/
// retires these without much warning — and swap in whatever's current.
const GEMINI_MODEL = "gemini-3.5-flash-lite";

// Latency: caps generation length so the model can't ramble past what's
// actually needed for a spoken reply — fewer tokens to generate means a
// faster response either way, streamed or not.
// gemini-3.5-flash-lite has "thinking": true like every other current
// model, and thinking tokens count against this same budget (confirmed
// ~165-175 tokens burned on thinking alone in earlier tests against a
// different thinking model) — so this needs real headroom, not a tight
// cap, or replies risk coming back completely empty (MAX_TOKENS hit
// before any visible text) like they did at 150-200 previously.
const MAX_OUTPUT_TOKENS = 800;

export function useVoiceAssistant(): UseVoiceAssistant {
  const [state, setState] = useState<AssistantState>("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // read inside callbacks without re-creating them on every mute toggle
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const SpeechRecognitionCtor = getSpeechRecognition();
  const supported = SpeechRecognitionCtor !== null && "speechSynthesis" in window;

  // Speaks one chunk, tracked via a pending-utterance counter so we only
  // drop back to "idle" once every queued chunk has actually finished —
  // not just the first one.
  const pendingUtterances = useRef(0);
  const streamDone = useRef(false);

  const maybeGoIdle = useCallback(() => {
    if (streamDone.current && pendingUtterances.current === 0) {
      setState("idle");
    }
  }, []);

  const speakChunk = useCallback(
    (text: string) => {
      if (mutedRef.current || !text.trim() || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      pendingUtterances.current += 1;
      utterance.onend = () => {
        pendingUtterances.current -= 1;
        maybeGoIdle();
      };
      utterance.onerror = () => {
        pendingUtterances.current -= 1;
        maybeGoIdle();
      };
      setState("speaking");
      window.speechSynthesis.speak(utterance);
    },
    [maybeGoIdle]
  );

  const askGemini = useCallback(
    async (userText: string) => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setErrorMessage("No API key found. Add VITE_GEMINI_API_KEY to a .env.local file and restart the dev server.");
        setState("error");
        return;
      }

      setState("thinking");
      window.speechSynthesis.cancel();
      pendingUtterances.current = 0;
      streamDone.current = false;

      const controller = new AbortController();
      abortRef.current = controller;

      let fullText = "";
      let unspoken = "";
      let lastChunk: unknown = null;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: "user", parts: [{ text: userText }] }],
              generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
            }),
          }
        );

        if (!response.ok || !response.body) {
          const detail = await response.text();
          throw new Error(`API error ${response.status}: ${detail.slice(0, 200)}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return; // blank lines / other SSE fields — ignore, not an error
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) return;

          let parsed: unknown;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            return; // partial/malformed line — skip rather than crash the stream
          }

          lastChunk = parsed;
          const delta = extractPartsText(parsed);
          if (!delta) return;

          fullText += delta;
          unspoken += delta;
          setReply(fullText);

          const { complete, rest } = splitCompleteSentences(unspoken);
          for (const sentence of complete) speakChunk(sentence);
          unspoken = rest;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // process every complete line as soon as it's available —
          // doesn't wait for a blank-line separator that some servers
          // never send (see popLine's doc comment for why that broke)
          let popped = popLine(buffer);
          while (popped.line !== null) {
            processLine(popped.line);
            buffer = popped.rest;
            popped = popLine(buffer);
          }
        }

        // stream ended — flush anything left in the buffer that never
        // got a trailing newline
        if (buffer.trim()) processLine(buffer);

        streamDone.current = true;
        if (unspoken.trim()) speakChunk(unspoken);

        if (!fullText.trim()) {
          const reason = explainEmptyReply(lastChunk);
          setErrorMessage(reason ? `No reply — ${reason}.` : "Sorry, I didn't get a response back.");
          setState("error");
          return;
        }

        maybeGoIdle();
      } catch (err) {
        streamDone.current = true;
        if (err instanceof DOMException && err.name === "AbortError") return; // cancelled on purpose, not a real error
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong reaching the assistant.");
        setState("error");
      }
    },
    [speakChunk, maybeGoIdle]
  );

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setErrorMessage("This browser doesn't support speech recognition. Try Chrome or Edge.");
      setState("error");
      return;
    }

    setErrorMessage(null);
    setTranscript("");
    setReply("");

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      askGemini(text);
    };
    recognition.onerror = () => {
      setErrorMessage("Couldn't hear that — check mic permissions and try again.");
      setState("error");
    };
    recognition.onend = () => {
      setState((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    setState("listening");
    recognition.start();
  }, [SpeechRecognitionCtor, askGemini]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (state === "listening") {
      stopListening();
    } else if (state === "idle" || state === "error") {
      startListening();
    } else if (state === "speaking" || state === "thinking") {
      abortRef.current?.abort();
      window.speechSynthesis.cancel();
      pendingUtterances.current = 0;
      streamDone.current = true;
      setState("idle");
    }
  }, [state, startListening, stopListening]);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) window.speechSynthesis.cancel(); // muting mid-reply stops it immediately
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.stop();
    abortRef.current?.abort();
    window.speechSynthesis.cancel();
    pendingUtterances.current = 0;
    streamDone.current = true;
    setTranscript("");
    setReply("");
    setErrorMessage(null);
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      abortRef.current?.abort();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return { state, transcript, reply, errorMessage, supported, muted, toggle, toggleMuted, reset };
}
