import { useEffect, useRef } from "react";
import { History, X } from "lucide-react";

import type { RoundRecord } from "@/features/game/types";
import { cx, formatCredits } from "@/lib/utils";

type HistoryPopoverProps = {
  history: RoundRecord[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function HistoryPopover({
  history,
  isOpen,
  onToggle,
  onClose,
}: HistoryPopoverProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideDismiss(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        popoverRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handleOutsideDismiss);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideDismiss);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className="relative flex h-full min-h-[52px] min-w-[52px] cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-300/10"
        aria-label="Show game history"
        aria-expanded={isOpen}
      >
        <History size={22} />
        {history.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-xs font-black text-black">
            {history.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-40 mt-3 w-[min(88vw,360px)] rounded-[1.35rem] bg-[#07100d]/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.62),inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Game history</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-stone-300 transition hover:border-amber-200/40 hover:text-amber-100"
              aria-label="Close history"
            >
              <X size={16} />
            </button>
          </div>
          <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-stone-500">
                Completed rounds will appear here until refresh.
              </p>
            ) : (
              history.map((record) => {
                const didParticipate = record.betCount > 0;
                const isWin = didParticipate && record.net > 0;
                const isLoss = didParticipate && record.net < 0;
                return (
                  <div
                    key={record.round}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-black text-white">
                        Round #{record.round}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-stone-500">
                        {record.result.join(" - ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {didParticipate ? (
                        <>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">
                            Bet {formatCredits(record.totalStake)}
                          </p>
                          <p
                            className={cx(
                              "text-sm font-black",
                              isWin && "text-amber-200",
                              isLoss && "text-rose-300",
                              !isWin && !isLoss && "text-stone-300",
                            )}
                          >
                            {isWin
                              ? `+${formatCredits(record.net)}`
                              : isLoss
                                ? `-${formatCredits(Math.abs(record.net))}`
                                : "Even"}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs font-semibold text-stone-600">
                          Did not participate
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
