import { DirectoryCard } from "@/components/directory/DirectoryCard";
import { CardCTA } from "@/components/directory/CardCTA";

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    title?: string | null;
    company?: string | null;
    specialties?: string[] | null;
    location?: string | null;
    photo?: string | null;
    archetype?: string | null;
    sector?: string | null;
  };
}

export const MentorCard = ({ mentor }: MentorCardProps) => {
  return (
    <DirectoryCard compact>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-mes-ink/10 text-mes-ink flex items-center justify-center font-semibold">
          {mentor.name
            .split(/\s+/)
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-semibold text-mes-ink leading-snug">{mentor.name}</h3>
          <div className="text-[12.5px] text-mes-ink-soft truncate">
            {mentor.title || mentor.archetype || ""}
            {mentor.company ? `, ${mentor.company}` : ""}
          </div>
        </div>
      </div>
      {mentor.sector && (
        <div className="mt-3 inline-flex self-start px-2 py-0.5 rounded-full border border-mes-blue-light bg-mes-blue-light/40 text-mes-teal-dark text-[11px] font-medium uppercase tracking-wider">
          {mentor.sector}
        </div>
      )}
      {mentor.specialties && mentor.specialties.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {mentor.specialties.slice(0, 4).map((s) => (
            <li
              key={s}
              className="text-[11.5px] text-mes-ink-soft border border-mes-border rounded-full px-2 py-0.5"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4">
        <CardCTA
          entity="mentor"
          target={{ entity: "mentor", id: mentor.id, name: mentor.name }}
          hideSecondary
        />
      </div>
    </DirectoryCard>
  );
};
