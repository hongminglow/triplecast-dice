import { ChipToken } from "@/components/betting/ChipToken";
import { getBetTheme } from "@/features/game/themes";
import type { BetOption, PendingBet } from "@/features/game/types";
import { cx } from "@/lib/utils";

type BetCardProps = {
  option: BetOption;
  pendingBet?: PendingBet;
  disabled: boolean;
  compact?: boolean;
  onClick: () => void;
};

export function BetCard({
  option,
  pendingBet,
  disabled,
  compact = false,
  onClick,
}: BetCardProps) {
  const theme = getBetTheme(option);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "group relative min-h-[30px] overflow-hidden rounded-lg border p-1 text-left shadow-lg transition-colors duration-200",
        pendingBet &&
          "ring-2 ring-amber-100/70 ring-offset-1 ring-offset-[#14110c]",
        disabled
          ? "cursor-not-allowed border-white/5 bg-white/[0.025] text-stone-500"
          : cx("cursor-pointer", theme.card),
      )}
    >
      <span
        className={cx(
          "mb-0.5 block h-0.5 w-7 rounded-full transition-colors duration-200",
          disabled ? "bg-white/10" : theme.rail,
        )}
      />
      {pendingBet && (
        <span
          className={cx(
            "pointer-events-none absolute z-10 rounded-full",
            compact ? "right-0.5 top-0.5" : "right-1 top-1",
          )}
        >
          <ChipToken
            value={pendingBet.stake}
            size={compact ? "mini" : "badge"}
            selected
          />
        </span>
      )}
      <span className="block text-[11px] font-black leading-tight text-white group-disabled:text-stone-500">
        {option.label}
      </span>
      <span className="mt-0.5 hidden text-[11px] leading-snug text-stone-400 2xl:block">
        {option.description}
      </span>
      <span
        className={cx(
          "mt-0.5 inline-flex rounded-full px-1.5 py-0 text-[9px] font-black",
          disabled ? "bg-white/5 text-stone-500" : theme.badge,
        )}
      >
        {option.payoutLabel}
      </span>
    </button>
  );
}
