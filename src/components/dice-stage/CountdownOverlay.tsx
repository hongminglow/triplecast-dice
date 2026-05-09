import { cx } from "@/lib/utils";

type CountdownOverlayProps = {
  secondsLeft: number;
  urgent: boolean;
};

export function CountdownOverlay({ secondsLeft, urgent }: CountdownOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div
        className={cx(
          "grid h-24 w-24 place-items-center rounded-full border bg-black/45 text-5xl font-black leading-none shadow-2xl backdrop-blur-sm transition",
          urgent
            ? "animate-[countdownPunch_1s_ease-in-out_infinite] border-red-300 text-red-200 shadow-red-500/30"
            : "border-emerald-200/40 text-emerald-100 shadow-emerald-400/20",
        )}
        aria-label={`${secondsLeft} seconds remaining`}
      >
        {secondsLeft}
      </div>
    </div>
  );
}
