import { DIE_VALUES, EXACT_TOTAL_PAYOUTS } from "@/features/game/constants";
import type { BetOption } from "@/features/game/types";

function createQuickBets(): BetOption[] {
  return [
    {
      id: "small",
      label: "Small",
      group: "Quick Bets",
      description: "4-10, no triples.",
      payoutLabel: "1:1",
      kind: "small",
    },
    {
      id: "big",
      label: "Big",
      group: "Quick Bets",
      description: "11-17, no triples.",
      payoutLabel: "1:1",
      kind: "big",
    },
    {
      id: "odd",
      label: "Odd",
      group: "Quick Bets",
      description: "Odd total.",
      payoutLabel: "1:1",
      kind: "odd",
    },
    {
      id: "even",
      label: "Even",
      group: "Quick Bets",
      description: "Even total.",
      payoutLabel: "1:1",
      kind: "even",
    },
  ];
}

function createTotalBets(): BetOption[] {
  return Array.from({ length: 14 }, (_, index) => {
    const total = index + 4;
    return {
      id: `total-${total}`,
      label: `${total}`,
      group: "Totals" as const,
      description:
        total <= 5 || total >= 16 ? "Rare edge hit." : "Hit this total.",
      payoutLabel: `${EXACT_TOTAL_PAYOUTS[total]}:1`,
      kind: "exactTotal" as const,
      target: total,
    };
  });
}

function createSingleBets(): BetOption[] {
  return DIE_VALUES.map((value) => ({
    id: `single-${value}`,
    label: `Single ${value}`,
    group: "Singles" as const,
    description: "Pays per match.",
    payoutLabel: "1x-3x",
    kind: "single" as const,
    target: value,
  }));
}

function createDoubleBets(): BetOption[] {
  return [
    {
      id: "any-double",
      label: "Any double",
      group: "Doubles",
      description: "Any pair.",
      payoutLabel: "3:1",
      kind: "anyDouble",
    },
    ...DIE_VALUES.map((value) => ({
      id: `double-${value}`,
      label: `${value}-${value}`,
      group: "Doubles" as const,
      description: `Pair of ${value}.`,
      payoutLabel: "8:1",
      kind: "specificDouble" as const,
      target: value,
    })),
  ];
}

function createTripleBets(): BetOption[] {
  return [
    {
      id: "any-triple",
      label: "Any triple",
      group: "Triples",
      description: "Any triple.",
      payoutLabel: "24:1",
      kind: "anyTriple",
    },
    ...DIE_VALUES.map((value) => ({
      id: `triple-${value}`,
      label: `${value}-${value}-${value}`,
      group: "Triples" as const,
      description: `Triple ${value}.`,
      payoutLabel: "150:1",
      kind: "specificTriple" as const,
      target: value,
    })),
  ];
}

export function createBetOptions(): BetOption[] {
  return [
    ...createQuickBets(),
    ...createTotalBets(),
    ...createSingleBets(),
    ...createDoubleBets(),
    ...createTripleBets(),
  ];
}

export const BET_OPTIONS = createBetOptions();

export function generateBetId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
