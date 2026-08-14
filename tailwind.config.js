/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B0E",
        card: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.08)",
        // single muted accent instead of a dual neon gradient —
        // desaturated slate-indigo reads calmer/more premium than the
        // original vivid blue/cyan pair.
        accent: "#6C7CE0",
        muted: "rgba(255,255,255,0.6)",
      },
      fontFamily: {
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.5)",
        glow: "0 0 50px rgba(108,124,224,0.25)",
      },
    },
  },
  plugins: [],
};
