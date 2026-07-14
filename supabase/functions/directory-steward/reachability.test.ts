import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyReachabilityStatus, isTimeoutError, PROBE_HEADERS } from "./reachability.ts";

test("classifyReachabilityStatus: 2xx/3xx are alive (true)", () => {
  for (const s of [200, 201, 204, 301, 302, 307, 308, 399]) {
    assert.equal(classifyReachabilityStatus(s), true, `status ${s} should be alive`);
  }
});

test("classifyReachabilityStatus: only 404/410 are definitively dead (false)", () => {
  assert.equal(classifyReachabilityStatus(404), false);
  assert.equal(classifyReachabilityStatus(410), false);
});

test("classifyReachabilityStatus: bot-block / auth / rate-limit statuses are null (not dead)", () => {
  // LinkedIn 999, WAF 403, auth 401, method/accept quirks, rate-limit — all live-but-blocking.
  for (const s of [401, 403, 405, 406, 429, 451, 999]) {
    assert.equal(classifyReachabilityStatus(s), null, `status ${s} must not read as dead`);
  }
});

test("classifyReachabilityStatus: 5xx and other 4xx are transient/ambiguous → null", () => {
  for (const s of [400, 418, 500, 502, 503, 504]) {
    assert.equal(classifyReachabilityStatus(s), null, `status ${s} must not read as dead`);
  }
});

test("classifyReachabilityStatus: non-finite/garbage status → null (not checkable)", () => {
  assert.equal(classifyReachabilityStatus(NaN), null);
  assert.equal(classifyReachabilityStatus(Infinity), null);
  // @ts-expect-error — guard is total even against a bad caller
  assert.equal(classifyReachabilityStatus(undefined), null);
});

test("isTimeoutError: abort/timeout rejections are timeouts; connection errors are not", () => {
  assert.equal(isTimeoutError(Object.assign(new Error("aborted"), { name: "AbortError" })), true);
  assert.equal(isTimeoutError(Object.assign(new Error("timed out"), { name: "TimeoutError" })), true);
  // DNS/connection/TLS failures surface as TypeError (or similar) → genuinely unreachable.
  assert.equal(isTimeoutError(new TypeError("error sending request: dns error")), false);
  assert.equal(isTimeoutError(new Error("connection refused")), false);
  assert.equal(isTimeoutError(null), false);
  assert.equal(isTimeoutError(undefined), false);
  assert.equal(isTimeoutError("AbortError"), false); // a bare string has no .name
});

test("PROBE_HEADERS: browser-like UA (not the old self-identifying agent that drew WAF 403s)", () => {
  assert.match(PROBE_HEADERS["user-agent"], /Mozilla\/5\.0/);
  assert.doesNotMatch(PROBE_HEADERS["user-agent"], /DirectorySteward/);
  assert.ok(PROBE_HEADERS["accept"].includes("text/html"));
});
