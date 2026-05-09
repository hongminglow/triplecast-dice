import { EXACT_TOTAL_PAYOUTS } from "@/features/game/constants";
import {
  countTarget,
  getDieCounts,
  hasTriple,
  totalDice,
} from "@/features/game/dice";
import type {
  BetOption,
  DiceResult,
  PayoutSummary,
  PlacedBet,
  RoundRecord,
} from "@/features/game/types";

export function evaluateBet(option: BetOption, result: DiceResult): number {
  const total = totalDice(result);
  const counts = getDieCounts(result);
  const triple = hasTriple(result);

  switch (option.kind) {
    case "small":
      return !triple && total >= 4 && total <= 10 ? 1 : 0;
    case "big":
      return !triple && total >= 11 && total <= 17 ? 1 : 0;
    case "odd":
      return total % 2 === 1 ? 1 : 0;
    case "even":
      return total % 2 === 0 ? 1 : 0;
    case "single":
      return option.target ? countTarget(result, option.target) : 0;
    case "anyDouble":
      return counts.some((count) => count >= 2) ? 3 : 0;
    case "specificDouble":
      return option.target && countTarget(result, option.target) >= 2 ? 8 : 0;
    case "anyTriple":
      return triple ? 24 : 0;
    case "specificTriple":
      return option.target && countTarget(result, option.target) === 3
        ? 150
        : 0;
    case "exactTotal":
      return option.target === total ? (EXACT_TOTAL_PAYOUTS[total] ?? 0) : 0;
  }
}

export function settleBets(
  bets: PlacedBet[],
  result: DiceResult,
): PayoutSummary {
  const outcomes = bets.map((bet) => {
    const multiplier = evaluateBet(bet.option, result);
    const didWin = multiplier > 0;
    const profit = didWin ? bet.stake * multiplier : -bet.stake;
    const payout = didWin ? bet.stake + bet.stake * multiplier : 0;
    return { bet, didWin, multiplier, payout, profit };
  });
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPayout = outcomes.reduce(
    (sum, outcome) => sum + outcome.payout,
    0,
  );

  return {
    totalStake,
    totalPayout,
    net: totalPayout - totalStake,
    outcomes,
  };
}

export function createRoundRecord(
  round: number,
  result: DiceResult,
  summary: PayoutSummary,
): RoundRecord {
  return {
    round,
    result,
    total: totalDice(result),
    betCount: summary.outcomes.length,
    totalStake: summary.totalStake,
    totalPayout: summary.totalPayout,
    net: summary.net,
  };
}
