import { Check, X } from "lucide-react";

import { ChipToken } from "@/components/betting/ChipToken";
import { CHIP_VALUES } from "@/features/game/constants";
import { cx, formatCredits } from "@/lib/utils";

type ChipSelectorProps = {
  selectedChip: number;
  onSelectChip: (chip: number) => void;
  canBet: boolean;
  canConfirm: boolean;
  pendingTotal: number;
  hasPendingBets: boolean;
  onConfirm: () => void;
  onClearPending: () => void;
};

export function ChipSelector({
  selectedChip,
  onSelectChip,
  canBet,
  canConfirm,
  pendingTotal,
  hasPendingBets,
  onConfirm,
  onClearPending,
}: ChipSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {CHIP_VALUES.map((chip) => (
        <button
          key={chip}
          type="button"
          aria-label={`${chip} chip`}
          disabled={!canBet}
          onClick={() => onSelectChip(chip)}
          className={cx(
            "grid h-10 w-10 place-items-center rounded-full transition",
            !canBet
              ? "cursor-not-allowed opacity-60"
              : selectedChip === chip
                ? "cursor-pointer -translate-y-0.5"
                : "cursor-pointer hover:-translate-y-0.5",
          )}
        >
          <ChipToken
            value={chip}
            selected={selectedChip === chip}
            disabled={!canBet}
          />
        </button>
      ))}
      <button
        type="button"
        disabled={!canConfirm}
        onClick={onConfirm}
        className={cx(
          "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-black transition",
          canConfirm
            ? "cursor-pointer border-emerald-100/55 bg-emerald-300 text-[#04100b] shadow-lg shadow-emerald-300/20 hover:-translate-y-0.5 hover:shadow-emerald-300/30"
            : "cursor-not-allowed border-white/5 bg-white/[0.03] text-stone-600",
        )}
      >
        <Check size={13} />
        {pendingTotal > 0
          ? `Confirm ${formatCredits(pendingTotal)}`
          : "Confirm"}
      </button>
      {hasPendingBets && (
        <button
          type="button"
          onClick={onClearPending}
          className="grid min-h-7 w-7 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/35 text-stone-300 transition hover:border-red-300/50 hover:text-red-200"
          aria-label="Clear queued bets"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
