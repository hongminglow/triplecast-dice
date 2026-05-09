import { TrendingDown, TrendingUp, Trophy } from "lucide-react";

import { STARTING_BALANCE } from "@/features/game/constants";
import type { RoundRecord } from "@/features/game/types";
import { cx, formatCredits } from "@/lib/utils";

type SessionSummaryProps = {
  balance: number;
  history: RoundRecord[];
};

export function SessionSummary({ balance, history }: SessionSummaryProps) {
  const roundsPlayed = history.filter((record) => record.betCount > 0).length;
  const totalStaked = history.reduce(
    (sum, record) => sum + record.totalStake,
    0,
  );
  const totalPaid = history.reduce(
    (sum, record) => sum + record.totalPayout,
    0,
  );
  const sessionNet = balance - STARTING_BALANCE;

  const isWinning = sessionNet > 0;
  const isLosing = sessionNet < 0;

  return (
    <section
      className={cx(
        "rounded-[1.35rem] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        isWinning ? "bg-amber-300/12" : "bg-white/5",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">
            Session
          </p>
          <h2 className="text-base font-black text-white">Total net</h2>
        </div>
        {isWinning ? (
          <Trophy className="text-amber-200" />
        ) : isLosing ? (
          <TrendingDown className="text-rose-300" />
        ) : (
          <TrendingUp className="text-stone-500" />
        )}
      </div>

      <div className="space-y-2">
        <p
          className={cx(
            "rounded-2xl p-2.5 text-center text-lg font-black",
            isWinning
              ? "bg-amber-300 text-black"
              : isLosing
                ? "bg-rose-500/15 text-rose-200"
                : "bg-white/5 text-stone-300",
          )}
        >
          {isWinning
            ? `+${formatCredits(sessionNet)}`
            : isLosing
              ? `-${formatCredits(Math.abs(sessionNet))}`
              : "Even"}
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
          <div className="rounded-xl bg-black/25 p-2 text-center">
            <p className="text-stone-400">Rounds</p>
            <p className="text-sm font-black text-white">{roundsPlayed}</p>
          </div>
          <div className="rounded-xl bg-black/25 p-2 text-center">
            <p className="text-stone-400">Staked</p>
            <p className="text-sm font-black text-white">
              {formatCredits(totalStaked)}
            </p>
          </div>
          <div className="rounded-xl bg-black/25 p-2 text-center">
            <p className="text-stone-400">Paid</p>
            <p className="text-sm font-black text-emerald-100">
              {formatCredits(totalPaid)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
