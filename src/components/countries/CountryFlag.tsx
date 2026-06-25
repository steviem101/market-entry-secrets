interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 code (e.g. "IE", "GB"). Null/unknown renders nothing. */
  countryCode: string | null | undefined;
  className?: string;
}

/* National flags use their official colours, not design-system tokens — these
   are brand marks of sovereign states, not themable UI surfaces. */

const IrelandFlag = () => (
  <svg viewBox="0 0 30 20" className="w-full h-full block" aria-hidden>
    <rect x="0" width="10" height="20" fill="#169B62" />
    <rect x="10" width="10" height="20" fill="#FFFFFF" />
    <rect x="20" width="10" height="20" fill="#FF883E" />
  </svg>
);

const UnitedKingdomFlag = () => (
  <svg viewBox="0 0 60 40" className="w-full h-full block" aria-hidden>
    <rect width="60" height="40" fill="#012169" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3" />
    <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const UnitedStatesFlag = () => {
  const stripeH = 40 / 13;
  return (
    <svg viewBox="0 0 60 40" className="w-full h-full block" aria-hidden>
      <rect width="60" height="40" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={i * stripeH} width="60" height={stripeH} fill="#FFFFFF" />
      ))}
      <rect width="24" height={stripeH * 7} fill="#3C3B6E" />
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={3 + col * 4.6}
            cy={3 + row * 4.6}
            r="0.9"
            fill="#FFFFFF"
          />
        ))
      )}
    </svg>
  );
};

const SingaporeFlag = () => (
  <svg viewBox="0 0 30 20" className="w-full h-full block" aria-hidden>
    <rect width="30" height="10" fill="#EF3340" />
    <rect y="10" width="30" height="10" fill="#FFFFFF" />
    {/* Crescent: white disc clipped by an offset red disc */}
    <circle cx="6" cy="5" r="3.2" fill="#FFFFFF" />
    <circle cx="7.4" cy="5" r="2.6" fill="#EF3340" />
    {/* Five stars (simplified as small discs) */}
    {[
      [10, 3],
      [12, 5],
      [11.2, 7.2],
      [8.8, 7.2],
      [8, 5],
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="0.7" fill="#FFFFFF" />
    ))}
  </svg>
);

const AustralianFlag = () => (
  <svg viewBox="0 0 60 30" className="w-full h-full block" aria-hidden>
    <rect width="60" height="30" fill="#012169" />
    <g transform="translate(0,0)">
      <rect x="0" y="0" width="30" height="15" fill="#012169" />
      <path d="M0,0 L30,15 M30,0 L0,15" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0,0 L30,15 M30,0 L0,15" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M15,0 L15,15 M0,7.5 L30,7.5" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M15,0 L15,15 M0,7.5 L30,7.5" stroke="#C8102E" strokeWidth="2" />
    </g>
    <circle cx="46" cy="8" r="1.6" fill="#FFFFFF" />
    <circle cx="51" cy="14" r="1.6" fill="#FFFFFF" />
    <circle cx="42" cy="18" r="1.6" fill="#FFFFFF" />
    <circle cx="50" cy="22" r="1.6" fill="#FFFFFF" />
    <circle cx="55" cy="19" r="1.2" fill="#FFFFFF" />
    <circle cx="9" cy="22" r="2" fill="#FFFFFF" />
  </svg>
);

const FLAGS: Record<string, () => JSX.Element> = {
  IE: IrelandFlag,
  GB: UnitedKingdomFlag,
  US: UnitedStatesFlag,
  SG: SingaporeFlag,
  AU: AustralianFlag,
};

export const CountryFlag = ({ countryCode, className }: CountryFlagProps) => {
  const code = countryCode?.toUpperCase();
  const Flag = code ? FLAGS[code] : undefined;

  // No verified flag for this country — render nothing rather than a wrong flag.
  if (!Flag) return null;

  const cls = className ?? "w-7 h-5 rounded-sm overflow-hidden border border-mes-border";
  return (
    <span className={cls} aria-label={code}>
      <Flag />
    </span>
  );
};
