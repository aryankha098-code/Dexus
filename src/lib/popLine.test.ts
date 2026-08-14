import test from "node:test";
import assert from "node:assert/strict";
import { popLine } from "./popLine.ts";

test("pops one complete line, keeps the rest buffered", () => {
  const { line, rest } = popLine("data: {\"a\":1}\ndata: {\"b\":2}\n");
  assert.equal(line, 'data: {"a":1}');
  assert.equal(rest, 'data: {"b":2}\n');
});

test("no newline yet returns null line, unchanged buffer", () => {
  const { line, rest } = popLine("data: {\"a\":1");
  assert.equal(line, null);
  assert.equal(rest, 'data: {"a":1');
});

test("handles single-newline-separated events (the actual bug case)", () => {
  const buffer = 'data: {"text":"Hello!"}\ndata: {"text":"World"}\n';
  const first = popLine(buffer);
  assert.equal(first.line, 'data: {"text":"Hello!"}');
  const second = popLine(first.rest);
  assert.equal(second.line, 'data: {"text":"World"}');
});

test("handles blank lines (double-newline SSE framing) without breaking", () => {
  const { line, rest } = popLine("data: {\"a\":1}\n\ndata: {\"b\":2}\n");
  assert.equal(line, 'data: {"a":1}');
  assert.equal(rest, '\ndata: {"b":2}\n');
  const next = popLine(rest);
  assert.equal(next.line, ""); // the blank separator line — caller skips non-"data:" lines
});

test("empty buffer returns null", () => {
  assert.equal(popLine("").line, null);
});
