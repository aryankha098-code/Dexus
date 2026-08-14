/**
 * Pops the first complete line (everything up to but not including the
 * next `\n`) off the front of `buffer`, if one exists yet.
 *
 * Used to parse an SSE stream line-by-line instead of waiting for a
 * blank-line (`\n\n`) event separator — the double-newline approach
 * silently dropped an entire response when the server sent events
 * separated by single newlines instead, since no boundary was ever
 * found and the buffered text just sat there unparsed until the stream
 * ended. Reading one line at a time works with either framing and
 * can't get stuck waiting for a separator that may never come.
 */
export function popLine(buffer: string): { line: string | null; rest: string } {
  const newlineIndex = buffer.indexOf("\n");
  if (newlineIndex === -1) return { line: null, rest: buffer };
  return { line: buffer.slice(0, newlineIndex), rest: buffer.slice(newlineIndex + 1) };
}
