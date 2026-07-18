import { useState } from "react";
import type { AccountBrief, Report } from "@/types/report";
import SectionCard from "./SectionCard";
import RequestHook from "./RequestHook";
import Rich from "./Rich";

const CHIP_LABELS: Record<AccountBrief["statusChips"][number], string> = {
  hiring: "HIRING NOW",
  tech: "TECH ID'D",
};

const AccountCard = ({ account }: { account: AccountBrief }) => (
  <div className="rounded-xl border border-report-border px-[30px] py-7">
    <div className="flex items-baseline justify-between gap-2.5">
      {account.url ? (
        <a href={account.url} target="_blank" rel="noopener" className="text-inherit">
          <b className="text-[15.5px] font-bold">{account.name} ↗</b>
        </a>
      ) : (
        <b className="text-[15.5px] font-bold">{account.name}</b>
      )}
      {account.statusChips.length > 0 && (
        <span
          className={`text-[8.5px] font-bold ${
            account.statusChips.includes("hiring") ? "text-report-good" : "text-report-muted"
          }`}
        >
          {account.statusChips.map((c) => CHIP_LABELS[c]).join(" · ")}
        </span>
      )}
    </div>
    <div className="mb-3 mt-1 text-[10px] font-medium uppercase text-report-caption">{account.meta}</div>
    <div className="text-[12.5px] leading-[1.7] text-report-ink-soft">
      <b>Signals:</b> <Rich as="span" text={account.signals} />{" "}
      {account.stack && (
        <>
          <b>Stack:</b> <Rich as="span" text={account.stack} />{" "}
        </>
      )}
      {account.fit && (
        <>
          <b>Fit:</b> <Rich as="span" text={account.fit} />
        </>
      )}
    </div>
    {(account.approach.length > 0 || account.angle) && (
      <div className="mt-3.5 border-t border-report-rule pt-3 text-[10.5px] font-medium leading-[1.8] text-report-ink-soft">
        {account.approach.length > 0 && (
          <>
            APPROACH&nbsp;&nbsp;{account.approach.join(" / ")}
            <br />
          </>
        )}
        {account.angle && <>ANGLE&nbsp;&nbsp;{account.angle}</>}
      </div>
    )}
  </div>
);

/**
 * Dashed gap card for an intake account without a usable brief (R5: never
 * apology prose). onRequest is the ticket-14 persistence/ops-notification
 * seam — the same contract as RequestHook.onRequest — so a brief request is
 * recorded, not client-side theatre.
 */
const GapCard = ({ name, reason, onRequest }: { name: string; reason: string; onRequest?: () => void }) => {
  const [requested, setRequested] = useState(false);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-dashed border-report-dash bg-report-hook-bg px-7 py-[22px]">
      <span className="text-[18px] font-bold text-report-warn">+1</span>
      <span className="flex-1 text-[12.5px] leading-[1.65] text-report-ink-soft">
        <b>{name} isn't fully covered.</b> {reason}
      </span>
      {requested ? (
        <span className="whitespace-nowrap text-[10px] font-bold text-report-confirm-text">REQUEST SENT ✓</span>
      ) : (
        <button
          type="button"
          onClick={() => {
            setRequested(true);
            onRequest?.();
          }}
          className="whitespace-nowrap rounded-lg border border-report-sky bg-white px-[18px] py-2.5 text-[12px] font-bold text-report-action transition-colors hover:bg-report-tint"
        >
          Request the brief
        </button>
      )}
    </div>
  );
};

/**
 * §04 first customers: briefed account cards (status chips, Signals/Stack/
 * Fit, APPROACH/ANGLE footer), dashed gap card for unbriefed intake
 * accounts, zero-briefed → ICP-guidance card + name-your-targets hook
 * (never apology prose — R5), and the worth-knowing buyer-behaviour callout.
 */
const AccountsSection = ({ report }: { report: Report }) => {
  const { accounts } = report;
  const unbriefed = accounts.unbriefed ?? [];
  const zeroBriefed = accounts.briefed.length === 0;
  return (
    <SectionCard label="04 · YOUR FIRST CUSTOMERS" className="pb-[60px]">
      <Rich
        text={accounts.intro}
        className="mb-7 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />

      {accounts.briefed.length > 0 && (
        <div className="grid grid-cols-3 gap-[22px]">
          {accounts.briefed.map((account, i) => (
            <AccountCard key={account.url || account.name || i} account={account} />
          ))}
        </div>
      )}

      {zeroBriefed && accounts.icpGuidance && (
        <>
          <div className="rounded-xl border border-report-border px-[30px] py-7">
            <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-report-action">
              YOUR ICP — WHO TO TARGET FIRST
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {accounts.icpGuidance.targetRoles.map((role) => (
                <span
                  key={role}
                  className="rounded-full border border-report-tint-border bg-report-tint px-3 py-1 text-[10.5px] font-bold text-report-action"
                >
                  {role}
                </span>
              ))}
            </div>
            <Rich
              text={accounts.icpGuidance.sectorFocus}
              className="text-[12.5px] leading-[1.7] text-report-ink-soft"
            />
            <div className="mt-3.5 border-t border-report-rule pt-3 text-[10.5px] font-medium leading-[1.8] text-report-ink-soft">
              ANGLE&nbsp;&nbsp;<Rich as="span" text={accounts.icpGuidance.angle} />
            </div>
          </div>
          <RequestHook
            className="mt-[22px]"
            copy={
              <>
                <b>Name your target accounts</b> and full briefs — signals, stack, approach — are added to
                this report.
              </>
            }
            buttonLabel="Name your targets"
            confirmation="Request sent — reply with your target accounts and their briefs will be added to this report."
          />
        </>
      )}

      <div className={`mt-[22px] grid gap-[22px] ${unbriefed.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
        {unbriefed.map((u, i) => (
          <GapCard key={u.name || i} name={u.name} reason={u.reason} />
        ))}
        {accounts.worthKnowing && (
          <div className="rounded-xl border border-report-tint-border bg-report-tint px-7 py-[22px] text-[12.5px] leading-[1.65] text-report-ink-soft">
            <b>Worth knowing:</b> <Rich as="span" text={accounts.worthKnowing} />
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default AccountsSection;
