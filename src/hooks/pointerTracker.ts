// ponytail: module-level singleton, not a hook. Every consumer (cursor
// glow, every parallax-tilted card, the background blobs) was previously
// registering its own `pointermove` listener + rAF loop just to know
// where the mouse is. Same input, read many times — so read it once.
// Ceiling: single global mutable pair, fine for one page of UI; if this
// ever needs to support multiple independent viewports (iframes, popouts)
// it'd need to become per-window instead of module-global.
let x = typeof window === "undefined" ? 0 : window.innerWidth / 2;
let y = typeof window === "undefined" ? 0 : window.innerHeight / 2;
let attached = false;

function ensureListener() {
  if (attached || typeof window === "undefined") return;
  window.addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
    },
    { passive: true }
  );
  attached = true;
}

export function getPointer(): { x: number; y: number } {
  ensureListener();
  return { x, y };
}
