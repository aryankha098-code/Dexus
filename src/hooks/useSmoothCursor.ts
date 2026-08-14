import { useEffect, useRef, type RefObject } from "react";
import { getPointer } from "./pointerTracker";

interface SmoothCursor {
  /** Ref to attach to the element you want to move with the smoothed cursor position. */
  targetRef: RefObject<HTMLDivElement>;
}

/**
 * Smoothly interpolates a target element's CSS custom properties
 * (--x, --y) toward the shared pointer position using
 * requestAnimationFrame. Respects reduced motion by snapping directly
 * to the pointer instead of easing.
 */
export function useSmoothCursor(): SmoothCursor {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = getPointer();
    let currentX = start.x;
    let currentY = start.y;
    let rafId = 0;

    const tick = () => {
      const { x, y } = getPointer();
      const ease = prefersReducedMotion ? 1 : 0.09;
      currentX += (x - currentX) * ease;
      currentY += (y - currentY) * ease;

      const el = targetRef.current;
      if (el) {
        el.style.setProperty("--x", `${currentX}px`);
        el.style.setProperty("--y", `${currentY}px`);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return { targetRef };
}
