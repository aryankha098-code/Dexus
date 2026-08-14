import test from "node:test";
import assert from "node:assert/strict";
import { extractReplyText } from "./extractReplyText.ts";

test("joins multiple text parts with no separator", () => {
  assert.equal(
    extractReplyText({ candidates: [{ content: { parts: [{ text: "Hi " }, { text: "there" }] } }] }),
    "Hi there"
  );
});

test("falls back on empty parts", () => {
  assert.equal(
    extractReplyText({ candidates: [{ content: { parts: [] } }] }),
    "Sorry, I didn't get a response back."
  );
});

test("falls back on missing candidates", () => {
  assert.equal(extractReplyText({}), "Sorry, I didn't get a response back.");
});

test("falls back on malformed input", () => {
  assert.equal(extractReplyText(null), "Sorry, I didn't get a response back.");
  assert.equal(extractReplyText(undefined), "Sorry, I didn't get a response back.");
  assert.equal(extractReplyText("not an object"), "Sorry, I didn't get a response back.");
});
