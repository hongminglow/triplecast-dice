import { useEffect, useRef } from "react";
import { History, X } from "lucide-react";

import type { RoundRecord } from "@/features/game/types";

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
              history.map((record) => (
                <div
                  key={record.round}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-black text-white">
                      Round #{record.round}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-400">
                      {record.result.join("-")}
                    </p>
                  </div>
                  <div className="grid h-12 min-w-12 place-items-center rounded-2xl border border-amber-100/20 bg-amber-200/10 px-3 text-xl font-black leading-none text-amber-100">
                    {record.total}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
