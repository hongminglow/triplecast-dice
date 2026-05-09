import type { DiceResult } from "@/features/game/types";
import { cx } from "@/lib/utils";

type ResultOverlayProps = {
  result: DiceResult;
  total: number;
  winning: boolean;
};

export function ResultOverlay({ result, total, winning }: ResultOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[1px]">
      <div
        className={cx(
          "rounded-[1.4rem] border px-5 py-3 text-center shadow-2xl backdrop-blur-md sm:px-8",
          winning
            ? "border-amber-100/60 bg-amber-300/18 shadow-amber-300/25"
            : "border-white/20 bg-black/45 shadow-black/50",
        )}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-100/80">
          Result is
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
          {result.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="grid h-11 w-11 place-items-center rounded-xl border border-amber-100/40 bg-[#fff7df] text-2xl font-black text-[#170d06] shadow-lg shadow-black/30 sm:h-14 sm:w-14 sm:text-3xl"
            >
              {value}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-100/80">
          Total {total}
        </p>
      </div>
    </div>
  );
}
