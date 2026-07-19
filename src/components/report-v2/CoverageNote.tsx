/**
 * Honest-degradation caption (t20). Rendered directly under a section's intro,
 * ABOVE its cards, ONLY when the adapter found no sector-relevant match in that
 * section — it states the basis the matcher actually used so a real-but-generic
 * fallback set never reads as sector-tailored. Plain string (no markdown-lite),
 * muted + italic so it reads as an honest caveat, not an error. Absent = renders
 * nothing (the common case — every sector the directory covers).
 */
const CoverageNote = ({ text }: { text?: string }) =>
  text ? (
    <p className="mb-6 flex max-w-[920px] items-start gap-1.5 text-[12px] italic leading-[1.6] text-report-caption">
      <span aria-hidden className="not-italic">ⓘ</span>
      <span>{text}</span>
    </p>
  ) : null;

export default CoverageNote;
