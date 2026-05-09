import type { BetGroup, DieValue } from "@/features/game/types";

export const STARTING_BALANCE = 5000;
export const IDLE_SECONDS = 5;
export const ROLLING_SECONDS = 10;
export const COUNTDOWN_SECONDS = 10;
export const LOCKDOWN_SECONDS = 4;
export const REVEAL_SECONDS = 3;
export const SETTLE_SECONDS = 5;

export const CHIP_VALUES = [10, 50, 100, 500, 1000] as const;

export const BET_GROUPS: BetGroup[] = [
  "Quick Bets",
  "Totals",
  "Singles",
  "Doubles",
  "Triples",
];

export const DIE_VALUES: DieValue[] = [1, 2, 3, 4, 5, 6];

export const EXACT_TOTAL_PAYOUTS: Record<number, number> = {
  4: 60,
  5: 30,
  6: 18,
  7: 12,
  8: 8,
  9: 6,
  10: 5,
  11: 5,
  12: 6,
  13: 8,
  14: 12,
  15: 18,
  16: 30,
  17: 60,
};

export const MAX_HISTORY_ITEMS = 50;
export const MAX_NICKNAME_LENGTH = 18;
