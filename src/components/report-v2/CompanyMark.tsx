/**
 * 28px rounded-square company monogram (README identity assets). Ticket 9
 * extends this into the full IdentitySlot (asset URL → monogram fallback);
 * §06 rows always render the monogram form.
 */
const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const CompanyMark = ({ name }: { name: string }) => (
  <span
    aria-hidden
    className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-report-inferred-bg align-middle text-[10px] font-bold text-report-muted"
  >
    {initialsOf(name)}
  </span>
);

export default CompanyMark;
