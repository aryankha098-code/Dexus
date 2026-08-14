# EchoMind AI

A single centered assistant card: mute/reset icons, a live transcript, a
flowing sine-wave visualizer, and a mic button overlapping the card's
bottom edge — built to match a specific reference design. Real voice
pipeline underneath: browser mic → streaming Gemini call → spoken reply.
React 18, TypeScript, Vite, Tailwind CSS, lucide-react. No animation
libraries — every motion is CSS keyframes or `requestAnimationFrame`.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your free Gemini API key in
npm run dev
```

Get a free key at https://aistudio.google.com/apikey.

Open the printed local URL, click the mic, allow microphone access, and
speak. Works in Chrome/Edge (Web Speech API support in Safari/Firefox is
limited or missing — the button disables itself if so).

⚠️ This calls the Gemini API directly from the browser, which ships your
API key to anyone who opens dev tools. Fine for local development, not
for a real deployment — put the call behind your own backend for that.

Build with `npm run build`, preview with `npm run preview`, run the self-
checks with `npm test` (needs Node 22.6+, no test framework installed on
purpose).

## Structure

```
src/
  components/
    Navigation.tsx        small floating brand chip, top-left
    Hero.tsx                centers the card on the page
    AssistantCard.tsx        the card: icons, transcript, wave, mic
    FlowingWave.tsx           layered scrolling sine-wave visualizer
    MicButton.tsx             white circle, overlaps the card's bottom edge
    CursorGlow.tsx            cursor-following radial light (desktop only)
    NeuralBackground.tsx      soft blue glow arced up from below the viewport
  hooks/
    useVoiceAssistant.ts   mic capture + streaming Gemini call + sentence-by-sentence speech
    pointerTracker.ts        one shared pointermove listener for every consumer
    useSmoothCursor.ts        cursor-glow position, built on pointerTracker
  lib/
    extractReplyText.ts    Gemini response -> reply string (+ raw extractPartsText for streaming)
    splitCompleteSentences.ts  pulls finished sentences out of a growing streamed buffer
    generateSinePath.ts        pure math for the wave visualizer's SVG paths
    *.test.ts               each has a self-check (node:test, run via `npm test`)
  styles/
    animations.css         all keyframes, respects prefers-reduced-motion
```

## Notes

- `CursorGlow` and `useSmoothCursor` write straight to DOM styles instead
  of React state, so cursor movement never triggers a re-render.
- `FlowingWave`'s scaleY (idle vs active) lives on a wrapper `<div>`, and
  the scroll animation lives on the `<svg>` inside it — putting both on
  the same element would let the CSS keyframe animation silently own
  `transform` and swallow the scaleY. Same pattern applies anywhere else
  in this codebase mixing a CSS animation with a JS/inline transform.
- Reduced motion is respected globally via a media query in
  `animations.css`.
- The mic pipeline is hardcoded to `gemini-flash-latest` — if Google
  renames/retires that model, update `GEMINI_MODEL` in
  `useVoiceAssistant.ts`.
