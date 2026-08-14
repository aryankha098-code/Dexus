import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import FlowingWave from "./FlowingWave";
import MicButton from "./MicButton";
import type { useVoiceAssistant } from "../hooks/useVoiceAssistant";

interface AssistantCardProps {
  assistant: ReturnType<typeof useVoiceAssistant>;
}

function useDisplayText(assistant: ReturnType<typeof useVoiceAssistant>) {
  const { state, transcript, reply, errorMessage } = assistant;

  if (state === "error" && errorMessage) return { text: errorMessage, tone: "error" as const };
  if (reply) return { text: reply, tone: "normal" as const };
  if (state === "thinking" || state === "listening") {
    if (transcript) return { text: transcript, tone: "normal" as const };
    if (state === "listening") return { text: "Listening…", tone: "muted" as const };
  }
  return { text: "Tap the mic and ask me anything.", tone: "muted" as const };
}

/**
 * The whole assistant UI in one card: mute/reset up top, live
 * transcript or reply in the middle, the wave visualizer, and the mic
 * button overlapping the card's bottom edge.
 */
export default function AssistantCard({ assistant }: AssistantCardProps) {
  const { state, muted, toggleMuted, reset } = assistant;
  const { text, tone } = useDisplayText(assistant);
  const isActive = state === "listening" || state === "speaking";

  return (
    <div className="relative w-full max-w-[380px]">
      <div
        className="rounded-[32px] border border-white/10 px-7 pb-8 pt-6 shadow-glass backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(42,53,102,0.55) 0%, rgba(8,10,20,0.9) 100%)",
        }}
      >
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleMuted}
            aria-pressed={muted}
            aria-label={muted ? "Unmute spoken replies" : "Mute spoken replies"}
            title={muted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset conversation"
            title="Reset conversation"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <p
          className={`mt-4 min-h-[4.5rem] text-left text-[15px] leading-relaxed ${
            tone === "error" ? "text-red-300" : tone === "muted" ? "text-white/40" : "text-white/85"
          }`}
          aria-live="polite"
        >
          {text}
        </p>

        <div className="mt-2">
          <FlowingWave active={isActive} />
        </div>
      </div>

      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2">
        <MicButton assistant={assistant} />
      </div>
    </div>
  );
}
