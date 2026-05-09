import { LockKeyhole } from "lucide-react";

import { cx } from "@/lib/utils";

type Corner = {
  id: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  armClass: string;
};

const CORNERS: Corner[] = [
  { id: "topLeft", armClass: "lock-chain-arm--top-left" },
  { id: "topRight", armClass: "lock-chain-arm--top-right" },
  { id: "bottomLeft", armClass: "lock-chain-arm--bottom-left" },
  { id: "bottomRight", armClass: "lock-chain-arm--bottom-right" },
];

export function TableLockOverlay() {
  return (
    <div className="pointer-events-auto absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/25">
      {CORNERS.map((corner) => (
        <img
          key={corner.id}
          src="/assets/images/chain-lock-arm.png"
          alt=""
          draggable={false}
          className={cx(
            "lock-chain-arm absolute opacity-0 drop-shadow-[0_0_22px_rgba(248,113,113,0.45)]",
            corner.armClass,
          )}
        />
      ))}
      <div className="lock-center-badge absolute inset-0 z-30 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200/55 bg-[#2a0807]/95 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-100 shadow-[0_0_32px_rgba(248,113,113,0.3)] backdrop-blur">
          <LockKeyhole size={14} />
          Game locked
        </div>
      </div>
    </div>
  );
}
