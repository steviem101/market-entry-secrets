import { Globe } from "lucide-react";

interface CountryFlagProps {
  countryCode: string | null | undefined;
  className?: string;
}

const VerticalTricolour = ({ stripes }: { stripes: [string, string, string] }) => (
  <svg viewBox="0 0 30 20" className="w-full h-full block" aria-hidden>
    <rect x="0" y="0" width="10" height="20" fill={stripes[0]} />
    <rect x="10" y="0" width="10" height="20" fill={stripes[1]} />
    <rect x="20" y="0" width="10" height="20" fill={stripes[2]} />
  </svg>
);

const IrishFlag = () => <VerticalTricolour stripes={["#169B62", "#FFFFFF", "#FF883E"]} />;

const UnionJack = () => (
  <svg viewBox="0 0 60 30" className="w-full h-full block" aria-hidden>
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0,0 L60,30" stroke="#C8102E" strokeWidth="2.5" strokeDasharray="30,30" />
    <path d="M60,0 L0,30" stroke="#C8102E" strokeWidth="2.5" strokeDasharray="30,30" transform="translate(0,0)" />
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const USFlag = () => (
  <svg viewBox="0 0 60 30" className="w-full h-full block" aria-hidden>
    <rect width="60" height="30" fill="#FFFFFF" />
    {[0, 2, 4, 6, 8, 10, 12].map((i) => (
      <rect key={i} x="0" y={i * (30 / 13)} width="60" height={30 / 13} fill="#B22234" />
    ))}
    <rect x="0" y="0" width="24" height={(30 / 13) * 7} fill="#3C3B6E" />
  </svg>
);

const SingaporeFlag = () => (
  <svg viewBox="0 0 60 30" className="w-full h-full block" aria-hidden>
    <rect width="60" height="15" fill="#ED2939" />
    <rect y="15" width="60" height="15" fill="#FFFFFF" />
    <circle cx="14" cy="7.5" r="4.6" fill="#FFFFFF" />
    <circle cx="15.6" cy="7.5" r="4.6" fill="#ED2939" />
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
  IE: IrishFlag,
  GB: UnionJack,
  US: USFlag,
  SG: SingaporeFlag,
  AU: AustralianFlag,
};

export const CountryFlag = ({ countryCode, className }: CountryFlagProps) => {
  const cls = className ?? "w-7 h-5 rounded-sm overflow-hidden border border-mes-border inline-flex items-center justify-center bg-muted text-muted-foreground";
  const code = countryCode?.toUpperCase();
  const Flag = code ? FLAGS[code] : undefined;

  return (
    <span className={cls} aria-label={code || "country"}>
      {Flag ? <Flag /> : <Globe className="w-3.5 h-3.5" aria-hidden />}
    </span>
  );
};
