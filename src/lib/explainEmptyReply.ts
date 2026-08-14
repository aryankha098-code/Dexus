interface GeminiChunk {
  candidates?: Array<{ finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
}

const FINISH_REASON_EXPLANATIONS: Record<string, string> = {
  SAFETY: "the reply was blocked by Gemini's safety filter",
  RECITATION: "the reply was blocked for closely matching existing text",
  MAX_TOKENS: "the reply was cut off by the token limit before generating any content — try raising MAX_OUTPUT_TOKENS",
  OTHER: "Gemini stopped generating for an unspecified reason",
};

const BLOCK_REASON_EXPLANATIONS: Record<string, string> = {
  SAFETY: "the prompt was blocked by Gemini's safety filter",
  OTHER: "the prompt was blocked for an unspecified reason",
};

/**
 * When a Gemini response comes back with no text, `finishReason` (on the
 * candidate) or `blockReason` (on promptFeedback) usually says why —
 * this turns those into a human-readable explanation instead of a
 * generic "no response" message. Falls back to `null` (caller decides
 * the generic message) if nothing diagnostic is present, e.g. a genuine
 * network/parsing failure rather than a model-side block.
 */
export function explainEmptyReply(lastChunk: unknown): string | null {
  const chunk = lastChunk as GeminiChunk | null | undefined;

  const blockReason = chunk?.promptFeedback?.blockReason;
  if (blockReason) {
    return BLOCK_REASON_EXPLANATIONS[blockReason] ?? `the prompt was blocked (${blockReason})`;
  }

  const finishReason = chunk?.candidates?.[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    return FINISH_REASON_EXPLANATIONS[finishReason] ?? `Gemini stopped early (${finishReason})`;
  }

  return null;
}
