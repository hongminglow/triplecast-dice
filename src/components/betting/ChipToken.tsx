import type { CSSProperties } from "react";

import { getChipTheme } from "@/features/game/themes";
import { cx, formatChipAmount } from "@/lib/utils";

type ChipTokenProps = {
  value: number;
  size?: "control" | "badge";
  selected?: boolean;
  disabled?: boolean;
};

export function ChipToken({
  value,
  size = "control",
  selected = false,
  disabled = false,
}: ChipTokenProps) {
  const theme = getChipTheme(value);
  const dimension = size === "badge" ? 26 : 38;
  const innerInset = size === "badge" ? 4 : 6;
  const amount = formatChipAmount(value);

  const chipStyle = {
    width: dimension,
    height: dimension,
    background: `repeating-conic-gradient(from 8deg, ${theme.notch} 0deg 10deg, ${theme.edge} 10deg 31deg)`,
    boxShadow: selected
      ? `0 0 0 2px rgba(255,255,255,0.78), 0 0 22px ${theme.glow}, inset 0 0 0 1px rgba(255,255,255,0.36)`
      : `0 8px 18px rgba(0,0,0,0.36), inset 0 0 0 1px rgba(255,255,255,0.28)`,
  } satisfies CSSProperties;

  const faceStyle = {
    inset: innerInset,
    background: `radial-gradient(circle at 35% 24%, rgba(255,255,255,0.92), ${theme.face} 34%, ${theme.inset} 100%)`,
  } satisfies CSSProperties;

  return (
    <span
      className={cx(
        "relative inline-grid shrink-0 place-items-center rounded-full border border-black/45 transition",
        selected && "scale-105",
        disabled && "opacity-35 grayscale",
      )}
      style={chipStyle}
      aria-hidden="true"
    >
      <span
        className="absolute rounded-full border border-white/35 shadow-inner"
        style={faceStyle}
      />
      <span className="absolute inset-[2px] rounded-full border border-white/25" />
      <span
        className={cx(
          "relative z-10 font-black leading-none tracking-normal",
          size === "badge"
            ? amount.length >= 4
              ? "text-[5px]"
              : "text-[7px]"
            : amount.length >= 4
              ? "text-[7px]"
              : "text-[8px]",
        )}
        style={{ color: theme.text }}
      >
        {amount}
      </span>
    </span>
  );
}
