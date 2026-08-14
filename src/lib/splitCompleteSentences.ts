/**
 * Splits off every *complete* sentence from the front of `text` (ends in
 * . ! or ? followed by whitespace), leaving any trailing partial
 * sentence in `rest`. Used to start speaking a streamed reply sentence
 * by sentence instead of waiting for the whole thing to finish
 * generating.
 *
 * Deliberately requires trailing whitespace after the terminator (not
 * end-of-string) so a chunk boundary mid-sentence — e.g. "3.14" split
 * across two network chunks — doesn't get read as a finished sentence.
 * Call again with `done: true` semantics (i.e. just use `rest` directly)
 * once the stream actually ends, to flush whatever's left.
 */
export function splitCompleteSentences(text: string): { complete: string[]; rest: string } {
  const matches = text.match(/[^.!?]*[.!?]+\s+/g);
  if (!matches) return { complete: [], rest: text };

  const consumedLength = matches.join("").length;
  return {
    complete: matches.map((s) => s.trim()).filter(Boolean),
    rest: text.slice(consumedLength),
  };
}
