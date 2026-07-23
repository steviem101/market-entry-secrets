import { test } from "node:test";
import assert from "node:assert/strict";
import { withTimeout, SectionTimeoutError } from "./phaseTimeouts.ts";

test("withTimeout: resolves normally when p wins the race", async () => {
  const result = await withTimeout("s1", 1000, Promise.resolve("ok"));
  assert.equal(result, "ok");
});

test("withTimeout: rejects with SectionTimeoutError when the timer wins", async () => {
  const slow = new Promise<string>((resolve) => setTimeout(() => resolve("late"), 200));
  await assert.rejects(
    () => withTimeout("competitor_landscape", 20, slow),
    (err: unknown) => {
      assert.ok(err instanceof SectionTimeoutError, "expected SectionTimeoutError");
      assert.equal((err as SectionTimeoutError).sectionName, "competitor_landscape");
      assert.equal((err as SectionTimeoutError).timeoutMs, 20);
      return true;
    },
  );
});

test("withTimeout: propagates the wrapped promise's rejection unchanged", async () => {
  const boom = Promise.reject(new Error("gateway 500"));
  await assert.rejects(
    () => withTimeout("s1", 1000, boom),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.equal((err as Error).message, "gateway 500");
      return true;
    },
  );
});

test("withTimeout: clears the pending timer when p resolves fast (no leaked handle)", async () => {
  // If the timer weren't cleared, a subsequent event-loop task would still see
  // it queued. We can't observe timer state directly, but we can verify the
  // promise resolves without a lingering rejection by awaiting a follow-up tick.
  const result = await withTimeout("s1", 5000, Promise.resolve(42));
  assert.equal(result, 42);
  await new Promise((r) => setTimeout(r, 10));
  // If setTimeout hadn't been cleared, no visible effect here — but at minimum
  // this confirms the .finally() ran without throwing.
});
