import { memo } from "react";
import { Mic, Loader2, AudioWaveform, MicOff } from "lucide-react";
import type { useVoiceAssistant } from "../hooks/useVoiceAssistant";

interface MicButtonProps {
  assistant: ReturnType<typeof useVoiceAssistant>;
}

/**
 * The primary mic control — white circle, dark icon, sits overlapping
 * the assistant card's bottom edge (positioned by the parent). Driven
 * by a shared useVoiceAssistant instance so the card's mute/reset
 * buttons act on the same conversation. Requires VITE_GEMINI_API_KEY
 * (see .env.example) and a browser that supports the Web Speech API.
 */
function MicButton({ assistant }: MicButtonProps) {
  const { state, supported, toggle } = assistant;

  const stateClass =
    state === "idle" ? "animate-mic-idle" : state === "speaking" ? "animate-mic-speaking" : "";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!supported}
      aria-pressed={state === "listening"}
      aria-label={
        !supported
          ? "Voice control unavailable in this browser"
          : state === "listening"
          ? "Stop listening"
          : "Start speaking"
      }
      className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-bg shadow-glow transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${stateClass}`}
    >
      {state === "thinking" && (
        <span
          className="animate-mic-thinking absolute -inset-1 rounded-full"
          style={{
            background: "conic-gradient(from var(--angle), rgba(108,124,224,0.15), #6C7CE0)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))",
          }}
        />
      )}

      {state === "listening" && (
        <span className="absolute inset-0 flex items-center justify-center gap-[3px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="animate-wave-bar w-[2px] rounded-full bg-bg/60"
              style={{
                height: `${20 + Math.random() * 55}%`,
                animationDuration: `${0.6 + Math.random() * 0.6}s`,
                animationDelay: `${Math.random() * -1}s`,
              }}
            />
          ))}
        </span>
      )}

      <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full">
        {!supported ? (
          <MicOff size={24} />
        ) : state === "thinking" ? (
          <Loader2 size={24} className="animate-spin" />
        ) : state === "speaking" ? (
          <AudioWaveform size={24} />
        ) : (
          <Mic size={24} className={state === "listening" ? "opacity-0" : "opacity-100"} />
        )}
      </span>
    </button>
  );
}

export default memo(MicButton);
