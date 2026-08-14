import { memo } from "react";

/**
 * Minimal ambient backdrop: a soft blue glow arcing up from below the
 * viewport, plus a vignette. Matches the reference's bottom-lit look —
 * light source below the card, not centered behind it.
 */
function NeuralBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg">
      <div
        className="absolute left-1/2 top-[92%] h-[520px] w-[900px] -translate-x-1/2 rounded-[50%] opacity-60 blur-[90px]"
        style={{ background: "radial-gradient(ellipse, rgba(108,124,224,0.35) 0%, transparent 68%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_30%,#0A0B0E_88%)]" />
    </div>
  );
}

export default memo(NeuralBackground);
