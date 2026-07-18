import type { PersonCard, Report } from "@/types/report";
import SectionCard from "./SectionCard";
import IdentitySlot from "./IdentitySlot";
import StarToggle from "./StarToggle";
import Rich from "./Rich";

const PersonName = ({ person }: { person: PersonCard }) => (
  <span>
    <IdentitySlot name={person.name} kind="person" src={person.headshotUrl} />
    {person.url ? (
      <a href={person.url} target="_blank" rel="noopener" className="text-inherit">
        <b className="text-[15.5px] font-bold">{person.name} ↗</b>
      </a>
    ) : (
      <b className="text-[15.5px] font-bold">{person.name}</b>
    )}
    <StarToggle name={person.name} url={person.url} section="Mentor" />
  </span>
);

/**
 * §07 mentors: 3 primary headshot cards (34px identity slot, caps role
 * line, why-line referencing the customer's product surfaces) + compact
 * extras row + optional research-advice callout.
 */
const MentorsSection = ({ report }: { report: Report }) => {
  const { mentors } = report;
  const extras = mentors.extra ?? [];
  return (
    <SectionCard label="07 · MENTOR RECOMMENDATIONS" className="pb-[60px]">
      <Rich
        text={mentors.intro}
        className="mb-7 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />
      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2 lg:grid-cols-3">
        {mentors.primary.map((person, i) => (
          <div key={i} className="rounded-xl border border-report-border px-[30px] py-7">
            <PersonName person={person} />
            <div className="mb-3 mt-1 text-[10px] font-medium uppercase text-report-caption">{person.role}</div>
            <Rich text={person.why} className="text-[12.5px] leading-[1.7] text-report-ink-soft" />
          </div>
        ))}
      </div>
      {extras.length > 0 && (
        <div className="mt-[22px] grid grid-cols-1 gap-[22px] md:grid-cols-2">
          {extras.map((person, i) => (
            <div
              key={i}
              className="rounded-xl border border-report-border px-7 py-5 text-[12.5px] leading-[1.7] text-report-ink-soft"
            >
              <IdentitySlot name={person.name} kind="person" src={person.headshotUrl} />
              {person.url ? (
                <a href={person.url} target="_blank" rel="noopener">
                  <b>{person.name} ↗</b>
                </a>
              ) : (
                <b>{person.name}</b>
              )}{" "}
              — {person.role} · <Rich as="span" text={person.why} />
            </div>
          ))}
        </div>
      )}
      {mentors.advice && (
        <div className="mt-[22px] rounded-xl border border-report-tint-border bg-report-tint px-7 py-5 text-[12.5px] leading-[1.7] text-report-ink-soft">
          <b>From the research — making mentor conversations count:</b>{" "}
          <Rich as="span" text={mentors.advice} />
        </div>
      )}
    </SectionCard>
  );
};

export default MentorsSection;
