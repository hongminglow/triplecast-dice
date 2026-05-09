import { Check, CircleDollarSign, X } from "lucide-react";

import { ChipToken } from "@/components/betting/ChipToken";
import { CHIP_VALUES } from "@/features/game/constants";
import { playSfx } from "@/lib/audio";
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
          onClick={() => {
            if (selectedChip === chip) return;
            playSfx("button-click");
            onSelectChip(chip);
          }}
          className={cx(
            "grid h-10 w-10 place-items-center rounded-full transition-transform duration-200",
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
      <ConfirmBetsButton
        canConfirm={canConfirm}
        pendingTotal={pendingTotal}
        onConfirm={onConfirm}
      />
      {hasPendingBets && (
        <button
          type="button"
          onClick={onClearPending}
          className="grid min-h-7 w-7 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/35 text-stone-300 transition-colors duration-200 hover:border-red-300/50 hover:text-red-200"
          aria-label="Clear queued bets"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

type ConfirmBetsButtonProps = {
  canConfirm: boolean;
  pendingTotal: number;
  onConfirm: () => void;
};

function ConfirmBetsButton({
  canConfirm,
  pendingTotal,
  onConfirm,
}: ConfirmBetsButtonProps) {
  const hasPending = pendingTotal > 0;

  return (
    <button
      type="button"
      disabled={!canConfirm}
      onClick={onConfirm}
      aria-label={
        hasPending ? `Confirm ${pendingTotal} credits` : "Confirm bets"
      }
      className={cx(
        "group relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border px-4 text-xs font-black uppercase tracking-[0.18em] transition-colors duration-200",
        canConfirm
          ? "cursor-pointer border-amber-100/55 bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-300 text-[#0f1a0d] shadow-[0_10px_30px_rgba(245,191,76,0.32),inset_0_1px_0_rgba(255,255,255,0.55)] hover:shadow-[0_14px_36px_rgba(245,191,76,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]"
          : "cursor-not-allowed border-white/8 bg-white/[0.03] text-stone-600",
      )}
    >
      {canConfirm && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/55 opacity-0 blur-sm transition-opacity duration-300 group-hover:left-full group-hover:opacity-80"
        />
      )}
      <span
        className={cx(
          "relative grid h-5 w-5 place-items-center rounded-full",
          canConfirm
            ? "bg-[#0f1a0d]/15 text-[#0f1a0d]"
            : "bg-white/5 text-stone-600",
        )}
      >
        {hasPending ? <CircleDollarSign size={12} /> : <Check size={12} />}
      </span>
      <span className="relative">
        {hasPending ? `Place ${formatCredits(pendingTotal)}` : "Place bet"}
      </span>
    </button>
  );
}
