import { ChipToken } from "@/components/betting/ChipToken";
import type {
  BetOutcome,
  PayoutSummary,
  PlacedBet,
} from "@/features/game/types";
import { cx, formatCredits } from "@/lib/utils";

type BetSlipProps = {
  bets: PlacedBet[];
  totalStaked: number;
  summary: PayoutSummary | null;
};

export function BetSlip({ bets, totalStaked, summary }: BetSlipProps) {
  return (
    <section className="min-h-0 rounded-[1.35rem] bg-white/[0.05] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/60">
            Slip
          </p>
          <h2 className="text-base font-black text-white">Current bets</h2>
        </div>
        <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100">
          {formatCredits(totalStaked)}
        </span>
      </div>

      <div className="max-h-[27vh] space-y-2 overflow-y-auto pr-1">
        {bets.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-stone-500">
            Your bet slip is empty.
          </p>
        ) : (
          bets.map((bet) => {
            const outcome = summary?.outcomes.find(
              (item) => item.bet.id === bet.id,
            );
            return <BetSlipRow key={bet.id} bet={bet} outcome={outcome} />;
          })
        )}
      </div>
    </section>
  );
}

type BetSlipRowProps = {
  bet: PlacedBet;
  outcome: BetOutcome | undefined;
};

function BetSlipRow({ bet, outcome }: BetSlipRowProps) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-2 rounded-2xl border p-2",
        outcome?.didWin
          ? "border-amber-200/35 bg-amber-300/10"
          : outcome
            ? "border-white/5 bg-black/25 opacity-60"
            : "border-white/10 bg-black/25",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <ChipToken value={bet.stake} size="badge" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-white">
            {bet.option.label}
          </p>
          <p className="text-[11px] text-stone-400">{bet.option.payoutLabel}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        {outcome ? (
          <span
            className={cx(
              "text-sm font-black",
              outcome.didWin ? "text-amber-100" : "text-stone-500",
            )}
          >
            {outcome.didWin ? `+${formatCredits(outcome.profit)}` : "Lost"}
          </span>
        ) : (
          <span className="text-sm font-black text-emerald-100">
            {formatCredits(bet.stake)}
          </span>
        )}
      </div>
    </div>
  );
}
