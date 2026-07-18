// syncPaging.ts — pure helpers for keyset pagination + watermark discipline.
//
// Why keyset (not .gt(ts) alone): source rows are bulk-inserted, so many share an
// identical created_at (verified: 589 document_chunks on one timestamp). Paging with
// .gt(ts, lastTs) skips every tied row past the batch boundary. A compound
// (ts, id) keyset — .or(ts.gt.X, and(ts.eq.X, id.gt.Y)) — drains tied groups exactly.
// Verified live against PostgREST.

/** Nil UUID — a lower bound below any real id, for seeding the first keyset page. */
export const NIL_ID = "00000000-0000-0000-0000-000000000000";

/** Postgres renders timestamptz with a space ("2026-02-16 00:55:29.942246+00");
 *  PostgREST filter values want ISO 8601 ("...T..."). Swap the single date/time space
 *  for 'T', PRESERVING microseconds (never round-trip through JS Date, which is ms). */
export function normalizeTs(ts: string): string {
  return ts.replace(" ", "T");
}

/** Lexical max of two timestamps after normalising both to the same ISO format.
 *  Used so a partial full/backfill run never regresses the watermark backward. */
export function maxTs(a: string, b: string): string {
  const na = normalizeTs(a), nb = normalizeTs(b);
  return na >= nb ? na : nb;
}

/** PostgREST `.or(...)` expression for the next keyset page after (ts, id). */
export function keysetOr(tsCol: string, idCol: string, ts: string, id: string): string {
  const t = normalizeTs(ts);
  return `${tsCol}.gt.${t},and(${tsCol}.eq.${t},${idCol}.gt.${id})`;
}
