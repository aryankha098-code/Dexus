interface GeminiPart {
  text?: string;
}
interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const FALLBACK_REPLY = "Sorry, I didn't get a response back.";

/**
 * Raw text out of a Gemini `generateContent`/`streamGenerateContent`
 * response chunk (`candidates[0].content.parts[].text`), no fallback —
 * an empty string is a valid result for a streaming chunk that carried
 * no text delta.
 */
export function extractPartsText(data: unknown): string {
  const candidate = (data as GeminiResponse)?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  return parts.map((part) => part?.text ?? "").join("");
}

/**
 * Same as extractPartsText, but for a *complete* (non-streaming)
 * response — falls back to a friendly message if there's nothing to
 * say, since this always needs to return something to be read aloud.
 */
export function extractReplyText(data: unknown): string {
  return extractPartsText(data).trim() || FALLBACK_REPLY;
}
