import test from "node:test";
import assert from "node:assert/strict";
import { explainEmptyReply } from "./explainEmptyReply.ts";

test("explains a safety-blocked prompt", () => {
  const msg = explainEmptyReply({ promptFeedback: { blockReason: "SAFETY" } });
  assert.match(msg ?? "", /safety filter/);
});

test("explains a safety-blocked reply via finishReason", () => {
  const msg = explainEmptyReply({ candidates: [{ finishReason: "SAFETY" }] });
  assert.match(msg ?? "", /safety filter/);
});

test("explains a MAX_TOKENS cutoff with actionable advice", () => {
  const msg = explainEmptyReply({ candidates: [{ finishReason: "MAX_TOKENS" }] });
  assert.match(msg ?? "", /MAX_OUTPUT_TOKENS/);
});

test("normal STOP finish reason has nothing to explain", () => {
  assert.equal(explainEmptyReply({ candidates: [{ finishReason: "STOP" }] }), null);
});

test("no diagnostic info at all returns null", () => {
  assert.equal(explainEmptyReply({}), null);
  assert.equal(explainEmptyReply(null), null);
  assert.equal(explainEmptyReply(undefined), null);
});

test("unknown reason code still produces a readable message", () => {
  const msg = explainEmptyReply({ candidates: [{ finishReason: "SOME_NEW_REASON" }] });
  assert.match(msg ?? "", /SOME_NEW_REASON/);
});
