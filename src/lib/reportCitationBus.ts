/**
 * Tiny window-event bridge between an inline citation marker and the (collapsed)
 * Sources list (Stage 5 render bug B11).
 *
 * The Sources card is a Radix Collapsible that starts closed, so its content —
 * including the `#source-N` anchors — is UNMOUNTED. An inline citation's
 * `getElementById('source-N')` therefore returned null and the click did
 * nothing. This bus lets the marker ask the Sources list to open itself first;
 * the list then scrolls to the anchor once its content has mounted.
 */

export const REPORT_CITATION_EVENT = "report:cite";

/** Fire when an inline citation is clicked. */
export function emitCitationClick(number: number): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REPORT_CITATION_EVENT, { detail: { number } }));
}

/** Subscribe the Sources list; returns an unsubscribe fn. */
export function onCitationClick(handler: (number: number) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    const n = (e as CustomEvent<{ number: number }>).detail?.number;
    if (typeof n === "number") handler(n);
  };
  window.addEventListener(REPORT_CITATION_EVENT, listener);
  return () => window.removeEventListener(REPORT_CITATION_EVENT, listener);
}
