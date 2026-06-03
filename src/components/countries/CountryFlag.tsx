interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

const STRIPE_FLAGS: Record<string, { stripes: [string, string, string]; orientation?: "vertical" }> = {
  IE: { stripes: ["#169B62", "#FFFFFF", "#FF883E"], orientation: "vertical" },
};

const renderStripes = ({ stripes }: { stripes: [string, string, string] }) => (
  <svg viewBox="0 0 30 20" className="w-full h-full block">
    <rect x="0" y="0" width="10" height="20" fill={stripes[0]} />
    <rect x="10" y="0" width="10" height="20" fill={stripes[1]} />
    <rect x="20" y="0" width="10" height="20" fill={stripes[2]} />
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

export const CountryFlag = ({ countryCode, className }: CountryFlagProps) => {
  const cls = className ?? "w-7 h-5 rounded-sm overflow-hidden border border-mes-border";
  const code = countryCode.toUpperCase();
  const flag = STRIPE_FLAGS[code];

  return (
    <span className={cls} aria-label={code}>
      {flag ? renderStripes(flag) : code === "AU" ? <AustralianFlag /> : renderStripes({ stripes: ["#169B62", "#FFFFFF", "#FF883E"] })}
    </span>
  );
};
