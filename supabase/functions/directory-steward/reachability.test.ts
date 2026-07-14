import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyReachabilityStatus, isTimeoutError, isDnsError, classifyReachabilityError, PROBE_HEADERS } from "./reachability.ts";

const withName = (name: string, message = name) => Object.assign(new Error(message), { name });

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

test("isTimeoutError: abort/timeout rejections are timeouts; other errors are not", () => {
  assert.equal(isTimeoutError(withName("AbortError", "aborted")), true);
  assert.equal(isTimeoutError(withName("TimeoutError", "timed out")), true);
  assert.equal(isTimeoutError(new TypeError("error sending request: dns error")), false);
  assert.equal(isTimeoutError(null), false);
  assert.equal(isTimeoutError("AbortError"), false); // a bare string has no .name
});

test("isDnsError: only DNS-resolution failures match (incl. via a cause chain)", () => {
  assert.equal(isDnsError(new TypeError("error sending request for url (https://x/): client error (Connect): dns error: failed to lookup address information: Name or service not known")), true);
  assert.equal(isDnsError(new TypeError("could not resolve host: example.invalid")), true);
  // nested in .cause
  assert.equal(isDnsError(Object.assign(new TypeError("fetch failed"), { cause: new Error("dns error") })), true);
  // NOT dns: connection reset / TLS / HTTP-2 / refused
  assert.equal(isDnsError(new TypeError("error sending request: connection reset by peer")), false);
  assert.equal(isDnsError(new TypeError("invalid peer certificate: UnknownIssuer")), false);
  assert.equal(isDnsError(new TypeError("http2 error: protocol error")), false);
  assert.equal(isDnsError(new TypeError("tcp connect error: Connection refused (os error 111)")), false);
  assert.equal(isDnsError(null), false);
});

test("classifyReachabilityError: only DNS failure is dead; timeout + connection-layer errors are null", () => {
  // dead = domain gone
  assert.equal(classifyReachabilityError(new TypeError("client error (Connect): dns error: failed to lookup address information")), false);
  // null = ambiguous (must not stage a live-but-blocking host)
  assert.equal(classifyReachabilityError(withName("AbortError", "aborted")), null);          // timeout
  assert.equal(classifyReachabilityError(new TypeError("connection reset by peer")), null);   // WAF reset (mckinsey/b2b)
  assert.equal(classifyReachabilityError(new TypeError("invalid peer certificate")), null);   // TLS
  assert.equal(classifyReachabilityError(new TypeError("http2 error: protocol error")), null);// HTTP-2 handshake
  assert.equal(classifyReachabilityError(new TypeError("Connection refused (os error 111)")), null);
});

test("PROBE_HEADERS: browser-like UA (not the old self-identifying agent that drew WAF 403s)", () => {
  assert.match(PROBE_HEADERS["user-agent"], /Mozilla\/5\.0/);
  assert.doesNotMatch(PROBE_HEADERS["user-agent"], /DirectorySteward/);
  assert.ok(PROBE_HEADERS["accept"].includes("text/html"));
});
