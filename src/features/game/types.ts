export type GamePhase =
  | "idle"
  | "rolling"
  | "countdown"
  | "lockdown"
  | "reveal"
  | "settling";

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
export type DiceResult = [DieValue, DieValue, DieValue];

export type BetGroup = "Quick Bets" | "Totals" | "Singles" | "Doubles" | "Triples";

export type BetKind =
  | "small"
  | "big"
  | "odd"
  | "even"
  | "single"
  | "anyDouble"
  | "specificDouble"
  | "anyTriple"
  | "specificTriple"
  | "exactTotal";

export type BetOption = {
  id: string;
  label: string;
  group: BetGroup;
  description: string;
  payoutLabel: string;
  kind: BetKind;
  target?: number;
};

export type PlacedBet = {
  id: string;
  option: BetOption;
  stake: number;
};

export type PendingBet = {
  option: BetOption;
  stake: number;
};

export type BetOutcome = {
  bet: PlacedBet;
  didWin: boolean;
  multiplier: number;
  payout: number;
  profit: number;
};

export type PayoutSummary = {
  totalStake: number;
  totalPayout: number;
  net: number;
  outcomes: BetOutcome[];
};

export type RoundRecord = {
  round: number;
  result: DiceResult;
  total: number;
  betCount: number;
  totalStake: number;
  totalPayout: number;
  net: number;
};
