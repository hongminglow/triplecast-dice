import { useMemo } from "react";

import { BetCard } from "@/components/betting/BetCard";
import { ChipSelector } from "@/components/betting/ChipSelector";
import { TableLockOverlay } from "@/components/betting/TableLockOverlay";
import { BET_OPTIONS } from "@/features/game/bets";
import { BET_GROUPS } from "@/features/game/constants";
import type { BetOption, PendingBet } from "@/features/game/types";
import { cx } from "@/lib/utils";

type BetBoardProps = {
  nickname: string;
  canBet: boolean;
  selectedChip: number;
  onSelectChip: (chip: number) => void;
  pendingBets: PendingBet[];
  pendingTotal: number;
  canConfirmBets: boolean;
  availableBalance: number;
  onQueueBet: (option: BetOption) => void;
  onConfirmPending: () => void;
  onClearPending: () => void;
};

export function BetBoard({
  nickname,
  canBet,
  selectedChip,
  onSelectChip,
  pendingBets,
  pendingTotal,
  canConfirmBets,
  availableBalance,
  onQueueBet,
  onConfirmPending,
  onClearPending,
}: BetBoardProps) {
  const groupedOptions = useMemo(
    () =>
      BET_GROUPS.map((group) => ({
        group,
        options: BET_OPTIONS.filter((option) => option.group === group),
      })),
    [],
  );

  const showLock = Boolean(nickname) && !canBet;

  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.35rem] bg-white/[0.045] p-2 pb-2 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(251,191,36,0.08)]">
      <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-black text-white">Bet board</h2>
        </div>
        <ChipSelector
          selectedChip={selectedChip}
          onSelectChip={onSelectChip}
          canBet={canBet}
          canConfirm={canConfirmBets}
          pendingTotal={pendingTotal}
          hasPendingBets={pendingBets.length > 0}
          onConfirm={onConfirmPending}
          onClearPending={onClearPending}
        />
      </div>

      {showLock && <TableLockOverlay />}

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
        {groupedOptions.map(({ group, options }) => (
          <section key={group}>
            <div className="mb-0.5 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
                {group}
              </h3>
            </div>
            <div
              className={cx(
                "grid gap-1",
                group === "Quick Bets" && "grid-cols-2 sm:grid-cols-4",
                group === "Totals" &&
                  "grid-cols-7 xl:grid-cols-[repeat(14,minmax(0,1fr))]",
                group === "Singles" && "grid-cols-3 sm:grid-cols-6",
                (group === "Doubles" || group === "Triples") &&
                  "grid-cols-3 sm:grid-cols-7",
              )}
            >
              {options.map((option) => {
                const pendingBet = pendingBets.find(
                  (bet) => bet.option.id === option.id,
                );
                const disabled = !canBet || availableBalance < selectedChip;
                return (
                  <BetCard
                    key={option.id}
                    option={option}
                    pendingBet={pendingBet}
                    disabled={disabled}
                    compact={group === "Totals"}
                    onClick={() => onQueueBet(option)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
