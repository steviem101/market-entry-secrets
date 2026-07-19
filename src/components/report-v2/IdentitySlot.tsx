import { useState } from "react";
import { entityInitials } from "@/lib/report-v2/format";

interface IdentitySlotProps {
  name: string;
  kind: "person" | "company";
  /** Resolved asset URL from the adapter. `platform:` refs and absent values
   *  render the monogram; a failed load falls back with no layout shift. */
  src?: string;
}

/**
 * Fixed identity slot (DECISIONS #6): 34px circle for people, 28px
 * rounded square (7px radius) for companies. Monogram fallback always
 * available; the image never drives layout.
 */
const IdentitySlot = ({ name, kind, src }: IdentitySlotProps) => {
  const [failed, setFailed] = useState(false);
  const isPerson = kind === "person";
  const frame = isPerson
    ? "mr-2 inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full align-middle"
    : "mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[7px] align-middle";
  const usable = src && !src.startsWith("platform:") && !failed;
  if (usable) {
    return (
      <span aria-hidden className={frame}>
        <img
          src={src}
          alt=""
          loading="lazy"
          width={isPerson ? 34 : 28}
          height={isPerson ? 34 : 28}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`${frame} ${
        isPerson
          ? "bg-report-person-bg text-[12.5px] font-bold text-report-action"
          : "bg-report-company-bg text-[11px] font-bold text-report-muted"
      }`}
    >
      {entityInitials(name)}
    </span>
  );
};

export default IdentitySlot;
