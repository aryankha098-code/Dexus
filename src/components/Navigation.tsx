import { AudioLines } from "lucide-react";

/**
 * Just a small floating brand mark, top-left — not a full nav bar.
 * Mute/reset live inside the assistant card now, next to the thing
 * they actually control.
 */
export default function Navigation() {
  return (
    <div className="animate-slide-down fixed left-5 top-5 z-30 sm:left-6 sm:top-6">
      <div className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 shadow-glass">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">
          <AudioLines size={14} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <span className="font-display text-sm font-medium tracking-tight text-white">EchoMind AI</span>
      </div>
    </div>
  );
}
