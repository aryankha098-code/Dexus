import test from "node:test";
import assert from "node:assert/strict";
import { generateSinePath } from "./generateSinePath.ts";

test("starts at x=0, vertically centered", () => {
  const path = generateSinePath(100, 40, 10, 50);
  assert.equal(path.startsWith("M 0 20.00"), true);
});

test("ends at x=width", () => {
  const path = generateSinePath(100, 40, 10, 50);
  const lastPoint = path.split(" ").slice(-2);
  assert.equal(lastPoint[0], "100.00");
});

test("zero amplitude gives a flat line down the middle", () => {
  const path = generateSinePath(100, 40, 0, 50, 0, 4);
  assert.equal(path, "M 0 20.00 L 25.00 20.00 L 50.00 20.00 L 75.00 20.00 L 100.00 20.00");
});

test("produces points+1 coordinate pairs", () => {
  const path = generateSinePath(100, 40, 10, 50, 0, 12);
  const commandCount = path.split(" L ").length; // 1 initial M + `points` L commands
  assert.equal(commandCount, 13);
});
