import { Trophy } from "lucide-react";

import type { DiceResult, PayoutSummary } from "@/features/game/types";
import { cx, formatCredits } from "@/lib/utils";

type RoundSummaryProps = {
  summary: PayoutSummary | null;
  result: DiceResult;
  resultTotal: number;
  hasWon: boolean;
};

export function RoundSummary({
  summary,
  result,
  resultTotal,
  hasWon,
}: RoundSummaryProps) {
  return (
    <section
      className={cx(
        "rounded-[1.35rem] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        summary
          ? hasWon
            ? "animate-[winPulse_900ms_ease-out] bg-amber-300/12"
            : "bg-white/[0.05]"
          : "bg-white/[0.05]",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">
            Result
          </p>
          <h2 className="text-base font-black text-white">Round summary</h2>
        </div>
        <Trophy className={hasWon ? "text-amber-200" : "text-stone-500"} />
      </div>

      {summary ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-2xl bg-black/30 p-2.5">
            <span className="text-sm text-stone-400">Dice</span>
            <span className="text-lg font-black text-white">
              {result.join(" + ")} = {resultTotal}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-black/25 p-2.5">
              <p className="text-stone-400">Staked</p>
              <p className="font-black">{formatCredits(summary.totalStake)}</p>
            </div>
            <div className="rounded-2xl bg-black/25 p-2.5">
              <p className="text-stone-400">Paid</p>
              <p className="font-black text-emerald-100">
                {formatCredits(summary.totalPayout)}
              </p>
            </div>
          </div>
          <p
            className={cx(
              "rounded-2xl p-2.5 text-center text-base font-black",
              summary.net > 0
                ? "bg-amber-300 text-black"
                : "bg-white/[0.05] text-stone-300",
            )}
          >
            {summary.net > 0
              ? `Won +${formatCredits(summary.net)}`
              : summary.net < 0
                ? `Lost ${formatCredits(Math.abs(summary.net))}`
                : "No net change"}
          </p>
        </div>
      ) : (
        <p className="rounded-2xl bg-black/25 p-2.5 text-sm leading-6 text-stone-400">
          Bets open only during countdown while the casino cover is closed. The
          dice reveal after lockdown.
        </p>
      )}
    </section>
  );
}
