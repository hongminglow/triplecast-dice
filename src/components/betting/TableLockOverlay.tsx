import { LockKeyhole } from "lucide-react";

import { cx } from "@/lib/utils";

const CORNERS = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;
type Corner = (typeof CORNERS)[number];

const LANE_CLASS: Record<Corner, string> = {
  topLeft: "lock-chain-lane--top-left",
  topRight: "lock-chain-lane--top-right",
  bottomLeft: "lock-chain-lane--bottom-left",
  bottomRight: "lock-chain-lane--bottom-right",
};

const ARM_CLASS: Record<Corner, string> = {
  topLeft: "lock-chain-arm--top-left",
  topRight: "lock-chain-arm--top-right",
  bottomLeft: "lock-chain-arm--bottom-left",
  bottomRight: "lock-chain-arm--bottom-right",
};

export function TableLockOverlay() {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/20">
      {CORNERS.map((corner) => (
        <div
          key={corner}
          className={cx("lock-chain-lane absolute inset-0", LANE_CLASS[corner])}
        >
          <img
            src="/assets/chain-lock-arm.png"
            alt=""
            className={cx(
              "lock-chain-arm absolute opacity-0 drop-shadow-[0_0_18px_rgba(203,213,225,0.36)]",
              ARM_CLASS[corner],
            )}
            draggable={false}
          />
        </div>
      ))}
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="lock-center-badge inline-flex items-center gap-2 rounded-full border border-red-200/55 bg-[#2a0807]/95 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-100 shadow-[0_0_32px_rgba(248,113,113,0.3)] backdrop-blur">
          <LockKeyhole size={14} />
          Table locked
        </div>
      </div>
    </div>
  );
}
