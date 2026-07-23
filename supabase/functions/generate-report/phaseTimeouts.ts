// MES-221 — per-section timeout wrapper.
//
// The section batch is `Promise.allSettled`, but a single section that stalls
// on the model gateway pushes `sections_ms` to whatever the gateway's own
// timeout is (typically well over the section budget). This wraps each write
// with a hard timeout so one slow section can never hold up the batch beyond
// `timeoutMs`; on timeout the caller records the section blank+hidden per
// existing failure conventions.

export class SectionTimeoutError extends Error {
  readonly sectionName: string;
  readonly timeoutMs: number;
  constructor(sectionName: string, timeoutMs: number) {
    super(`Section ${sectionName}: timeout after ${timeoutMs}ms`);
    this.name = "SectionTimeoutError";
    this.sectionName = sectionName;
    this.timeoutMs = timeoutMs;
  }
}

/** Race `p` against a `timeoutMs` timer. Clears the timer on either outcome so
 *  a fast resolve doesn't leak a pending timer to the edge worker. */
export function withTimeout<T>(
  sectionName: string,
  timeoutMs: number,
  p: Promise<T>,
): Promise<T> {
  let timerHandle: ReturnType<typeof setTimeout> | undefined;
  const timer = new Promise<never>((_, reject) => {
    timerHandle = setTimeout(() => reject(new SectionTimeoutError(sectionName, timeoutMs)), timeoutMs);
  });
  return Promise.race([p, timer]).finally(() => {
    if (timerHandle !== undefined) clearTimeout(timerHandle);
  });
}
