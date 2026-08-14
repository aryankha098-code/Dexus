import test from "node:test";
import assert from "node:assert/strict";
import { splitCompleteSentences } from "./splitCompleteSentences.ts";

test("splits one complete sentence, keeps the rest", () => {
  const { complete, rest } = splitCompleteSentences("Hi there. How are");
  assert.deepEqual(complete, ["Hi there."]);
  assert.equal(rest, "How are");
});

test("splits multiple complete sentences", () => {
  const { complete, rest } = splitCompleteSentences("One. Two! Three");
  assert.deepEqual(complete, ["One.", "Two!"]);
  assert.equal(rest, "Three");
});

test("does not treat end-of-buffer punctuation as complete (chunk boundary safety)", () => {
  const { complete, rest } = splitCompleteSentences("The value is 3.");
  assert.deepEqual(complete, []);
  assert.equal(rest, "The value is 3.");
});

test("no punctuation yet", () => {
  const { complete, rest } = splitCompleteSentences("still going");
  assert.deepEqual(complete, []);
  assert.equal(rest, "still going");
});
