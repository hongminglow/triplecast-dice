import type { RoundRecord } from "@/features/game/types";
import { cx, formatCredits } from "@/lib/utils";

type RoundHistoryProps = {
  history: RoundRecord[];
};

export function RoundHistory({ history }: RoundHistoryProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[1.35rem] bg-white/5 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-black text-white">Round history</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-0.5">
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-stone-500">
            Completed rounds will appear here.
          </p>
        ) : (
          history.map((record) => <RoundHistoryRow key={record.round} record={record} />)
        )}
      </div>
    </section>
  );
}

type RoundHistoryRowProps = {
  record: RoundRecord;
};

function RoundHistoryRow({ record }: RoundHistoryRowProps) {
  const didParticipate = record.betCount > 0;
  const isWin = didParticipate && record.net > 0;
  const isLoss = didParticipate && record.net < 0;

  return (
    <div
      className={cx(
        "flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5",
        isWin
          ? "border-amber-200/30 bg-amber-300/10"
          : isLoss
            ? "border-rose-200/15 bg-rose-500/5"
            : "border-white/8 bg-black/25",
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-black leading-tight text-white">
          Round - {record.round}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          {record.result.join(" - ")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {didParticipate ? (
          <>
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-500">
              Bet {formatCredits(record.totalStake)}
            </p>
            <p
              className={cx(
                "text-sm font-black leading-tight",
                isWin && "text-amber-200",
                isLoss && "text-rose-300",
                !isWin && !isLoss && "text-stone-300",
              )}
            >
              {isWin
                ? `+${formatCredits(record.net)}`
                : isLoss
                  ? `-${formatCredits(Math.abs(record.net))}`
                  : "Even"}
            </p>
          </>
        ) : (
          <p className="text-[11px] font-semibold text-stone-600">
            No bet
          </p>
        )}
      </div>
    </div>
  );
}
