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
        "group relative inline-flex h-10 min-w-[134px] items-center justify-center gap-2 overflow-hidden rounded-lg border px-3 text-[11px] font-black uppercase tracking-[0.14em] transition duration-200",
        canConfirm
          ? "cursor-pointer border-amber-300/60 bg-[#191007] text-amber-100 shadow-[0_8px_24px_rgba(0,0,0,0.32),0_0_22px_rgba(245,158,11,0.16),inset_0_1px_0_rgba(255,236,179,0.22)] hover:-translate-y-0.5 hover:border-amber-200/85 hover:bg-[#221407] hover:shadow-[0_12px_30px_rgba(0,0,0,0.38),0_0_28px_rgba(245,158,11,0.24),inset_0_1px_0_rgba(255,236,179,0.32)] active:translate-y-0"
          : "cursor-not-allowed border-white/8 bg-black/20 text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
    >
      {canConfirm && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(252,211,77,0.22),transparent_38%)] opacity-90"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 top-0 h-px bg-amber-100/45"
          />
        </>
      )}
      <span
        className={cx(
          "relative grid h-5 w-5 shrink-0 place-items-center rounded-md border",
          canConfirm
            ? "border-amber-200/50 bg-amber-300/15 text-amber-200 shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]"
            : "border-white/5 bg-white/5 text-stone-600",
        )}
      >
        {hasPending ? <CircleDollarSign size={12} /> : <Check size={12} />}
      </span>
      <span className="relative whitespace-nowrap">
        {hasPending ? `Place ${formatCredits(pendingTotal)}` : "Place bet"}
      </span>
    </button>
  );
}
