import { memo, useMemo } from "react";
import { generateSinePath } from "../lib/generateSinePath";

interface FlowingWaveProps {
  /** Bigger amplitude + faster motion while actually listening/speaking. */
  active: boolean;
}

const WIDTH = 400;
const HEIGHT = 110;

// Three layered sine waves at different amplitudes/wavelengths/phases —
// same trick real "audio wave" art uses: no single wave looks organic,
// three overlapping ones do.
const LAYERS = [
  { amplitude: 14, wavelength: 130, phase: 0, opacity: 0.9, strokeWidth: 2 },
  { amplitude: 22, wavelength: 90, phase: 1.4, opacity: 0.5, strokeWidth: 1.5 },
  { amplitude: 10, wavelength: 60, phase: 3.1, opacity: 0.35, strokeWidth: 1.5 },
];

/**
 * A flowing, continuously-scrolling sine-wave visualizer (SVG paths
 * translating via CSS, no JS render loop). Each layer is drawn twice
 * back-to-back and the pair scrolls left by exactly one copy-width, so
 * the loop is seamless regardless of wavelength.
 */
function FlowingWave({ active }: FlowingWaveProps) {
  const paths = useMemo(
    () => LAYERS.map((layer) => generateSinePath(WIDTH, HEIGHT, layer.amplitude, layer.wavelength, layer.phase)),
    []
  );

  return (
    <div
      className="relative h-[90px] w-full overflow-hidden"
      role="img"
      aria-label={active ? "Live audio waveform" : "Idle waveform"}
    >
      {/* scaleY lives on this wrapper via a plain CSS transition; the
          scroll animation lives on the svg below. Putting both on the
          same element would let the keyframe animation silently own
          `transform` and swallow the scaleY. */}
      <div
        className="h-full w-full origin-center transition-transform duration-500 ease-out"
        style={{ transform: active ? "scaleY(1)" : "scaleY(0.55)" }}
      >
        <svg
          viewBox={`0 0 ${WIDTH * 2} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-full w-[200%]"
          style={{ animation: `wave-scroll ${active ? 3.5 : 7}s linear infinite` }}
        >
          {LAYERS.map((layer, i) => (
            <g key={i} opacity={layer.opacity}>
              <path
                d={paths[i]}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth={layer.strokeWidth}
                strokeLinecap="round"
              />
              <path
                d={paths[i]}
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth={layer.strokeWidth}
                strokeLinecap="round"
                transform={`translate(${WIDTH}, 0)`}
              />
            </g>
          ))}
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C7CE0" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#9AA6F5" stopOpacity="1" />
              <stop offset="100%" stopColor="#6C7CE0" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default memo(FlowingWave);
