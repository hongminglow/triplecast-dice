import { CHIP_VALUES } from "@/features/game/constants";
import type { BetOption } from "@/features/game/types";

export type ChipTheme = {
  edge: string;
  notch: string;
  face: string;
  inset: string;
  text: string;
  glow: string;
};

export const CHIP_THEMES: Record<number, ChipTheme> = {
  10: {
    edge: "#b91c1c",
    notch: "#090909",
    face: "#ef4444",
    inset: "#7f1d1d",
    text: "#fff7ed",
    glow: "rgba(248,113,113,0.42)",
  },
  50: {
    edge: "#eab308",
    notch: "#090909",
    face: "#fde047",
    inset: "#ca8a04",
    text: "#1c1002",
    glow: "rgba(250,204,21,0.42)",
  },
  100: {
    edge: "#059669",
    notch: "#090909",
    face: "#34d399",
    inset: "#065f46",
    text: "#03140e",
    glow: "rgba(52,211,153,0.42)",
  },
  500: {
    edge: "#2563eb",
    notch: "#090909",
    face: "#60a5fa",
    inset: "#1e3a8a",
    text: "#eff6ff",
    glow: "rgba(96,165,250,0.42)",
  },
  1000: {
    edge: "#7c3aed",
    notch: "#090909",
    face: "#c084fc",
    inset: "#4c1d95",
    text: "#fff7ff",
    glow: "rgba(192,132,252,0.42)",
  },
};

export function getChipTheme(value: number): ChipTheme {
  const exactTheme = CHIP_THEMES[value];
  if (exactTheme) return exactTheme;

  const fallbackValue =
    [...CHIP_VALUES].reverse().find((chip) => value >= chip) ?? CHIP_VALUES[0];
  return CHIP_THEMES[fallbackValue];
}

export type BetTheme = {
  rail: string;
  card: string;
  badge: string;
};

export function getBetTheme(option: BetOption): BetTheme {
  if (option.kind === "small") {
    return {
      rail: "bg-emerald-300",
      card: "border-emerald-200/30 bg-gradient-to-br from-emerald-500/24 via-[#11291f] to-[#07110d] text-emerald-50 hover:border-emerald-100/70 hover:shadow-emerald-300/25",
      badge: "bg-emerald-200 text-emerald-950",
    };
  }

  if (option.kind === "big") {
    return {
      rail: "bg-rose-300",
      card: "border-rose-200/30 bg-gradient-to-br from-rose-500/24 via-[#301417] to-[#100707] text-rose-50 hover:border-rose-100/70 hover:shadow-rose-300/25",
      badge: "bg-rose-200 text-rose-950",
    };
  }

  if (option.kind === "odd") {
    return {
      rail: "bg-fuchsia-300",
      card: "border-fuchsia-200/30 bg-gradient-to-br from-fuchsia-500/24 via-[#29152f] to-[#0c0710] text-fuchsia-50 hover:border-fuchsia-100/70 hover:shadow-fuchsia-300/25",
      badge: "bg-fuchsia-200 text-fuchsia-950",
    };
  }

  if (option.kind === "even") {
    return {
      rail: "bg-cyan-300",
      card: "border-cyan-200/30 bg-gradient-to-br from-cyan-500/24 via-[#102832] to-[#061014] text-cyan-50 hover:border-cyan-100/70 hover:shadow-cyan-300/25",
      badge: "bg-cyan-200 text-cyan-950",
    };
  }

  if (option.kind === "single") {
    return {
      rail: "bg-lime-300",
      card: "border-lime-200/25 bg-gradient-to-br from-lime-400/18 via-[#1f2910] to-[#090f06] text-lime-50 hover:border-lime-100/60 hover:shadow-lime-300/20",
      badge: "bg-lime-200 text-lime-950",
    };
  }

  if (option.kind === "anyDouble" || option.kind === "specificDouble") {
    return {
      rail: "bg-amber-300",
      card: "border-amber-200/28 bg-gradient-to-br from-amber-400/20 via-[#2d210d] to-[#110b05] text-amber-50 hover:border-amber-100/70 hover:shadow-amber-300/24",
      badge: "bg-amber-200 text-amber-950",
    };
  }

  if (option.kind === "anyTriple" || option.kind === "specificTriple") {
    return {
      rail: "bg-pink-300",
      card: "border-pink-200/28 bg-gradient-to-br from-pink-500/22 via-[#311126] to-[#120711] text-pink-50 hover:border-pink-100/70 hover:shadow-pink-300/24",
      badge: "bg-pink-200 text-pink-950",
    };
  }

  const edgeTotal =
    option.target === 4 ||
    option.target === 5 ||
    option.target === 16 ||
    option.target === 17;
  return {
    rail: edgeTotal ? "bg-yellow-200" : "bg-sky-300",
    card: edgeTotal
      ? "border-yellow-200/30 bg-gradient-to-br from-yellow-300/20 via-[#2d260d] to-[#111006] text-yellow-50 hover:border-yellow-100/70 hover:shadow-yellow-300/24"
      : "border-sky-200/25 bg-gradient-to-br from-sky-400/18 via-[#112239] to-[#061019] text-sky-50 hover:border-sky-100/60 hover:shadow-sky-300/20",
    badge: edgeTotal
      ? "bg-yellow-100 text-yellow-950"
      : "bg-sky-200 text-sky-950",
  };
}
