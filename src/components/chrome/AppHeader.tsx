import { Dices, UserRound } from "lucide-react";

import { HistoryPopover } from "@/components/chrome/HistoryPopover";
import type { RoundRecord } from "@/features/game/types";
import { formatCredits } from "@/lib/utils";

type AppHeaderProps = {
  nickname: string;
  balance: number;
  roundNumber: number;
  history: RoundRecord[];
  isHistoryOpen: boolean;
  onToggleHistory: () => void;
  onCloseHistory: () => void;
};

export function AppHeader({
  nickname,
  balance,
  roundNumber,
  history,
  isHistoryOpen,
  onToggleHistory,
  onCloseHistory,
}: AppHeaderProps) {
  return (
    <header className="relative z-50 flex flex-col gap-2 rounded-[1.35rem] border border-amber-100/14 bg-[#100805]/70 p-2 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100 ring-1 ring-amber-100/25">
          <Dices size={23} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-100/60">
            Live Sic Bo &middot; Table 07
          </p>
          <h1 className="text-base font-black tracking-normal text-white sm:text-xl">
            TripleCast Royale
          </h1>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-2 text-sm md:justify-end">
        <div className="min-w-[128px] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 md:flex-none">
          <p className="flex items-center gap-1 text-xs text-stone-400">
            <UserRound size={13} /> Player
          </p>
          <p className="truncate font-bold text-white">
            {nickname || "Guest"}
          </p>
        </div>
        <div className="min-w-[128px] flex-1 rounded-2xl border border-emerald-200/20 bg-emerald-300/[0.08] px-3 py-1.5 md:flex-none">
          <p className="text-xs text-stone-400">Balance</p>
          <p className="font-bold text-emerald-100">{formatCredits(balance)}</p>
        </div>
        <div className="min-w-[96px] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 md:flex-none">
          <p className="text-xs text-stone-400">Round</p>
          <p className="font-bold text-white">#{roundNumber}</p>
        </div>
        <HistoryPopover
          history={history}
          isOpen={isHistoryOpen}
          onToggle={onToggleHistory}
          onClose={onCloseHistory}
        />
      </div>
    </header>
  );
}
