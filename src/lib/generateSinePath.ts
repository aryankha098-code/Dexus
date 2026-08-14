/**
 * Generates an SVG path `d` string tracing one sine wave across `width`,
 * vertically centered in `height`. Used to draw the flowing waveform —
 * kept as a pure function (no DOM, no React) so the math is directly
 * testable without mounting anything.
 */
export function generateSinePath(
  width: number,
  height: number,
  amplitude: number,
  wavelength: number,
  phase = 0,
  points = 60
): string {
  const midY = height / 2;
  const coords: string[] = [`M 0 ${midY.toFixed(2)}`];

  for (let i = 1; i <= points; i++) {
    const x = (i / points) * width;
    const y = midY + amplitude * Math.sin((x / wavelength) * 2 * Math.PI + phase);
    coords.push(`L ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return coords.join(" ");
}
