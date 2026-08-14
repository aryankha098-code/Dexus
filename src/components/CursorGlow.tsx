import { memo, type CSSProperties } from "react";
import { useSmoothCursor } from "../hooks/useSmoothCursor";

/**
 * A soft blue radial light that trails the cursor using smoothed
 * requestAnimationFrame interpolation. Sits above the background but
 * below content, in "screen"-ish blend so it reads as ambient light
 * rather than a flat circle.
 */
function CursorGlow() {
  const { targetRef } = useSmoothCursor();

  return (
    <div
      ref={targetRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
      style={
        {
          "--x": "50vw",
          "--y": "50vh",
          background:
            "radial-gradient(600px circle at var(--x) var(--y), rgba(91,140,255,0.14), rgba(0,212,255,0.05) 40%, transparent 70%)",
        } as CSSProperties
      }
    />
  );
}

export default memo(CursorGlow);
