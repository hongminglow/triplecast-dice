import { motion, useReducedMotion } from "motion/react";
import { LockKeyhole } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * The source artwork is already a diagonal chain. Each arm uses the same
 * full-size image clipped to one quadrant; two arms are mirrored vertically to
 * form the opposite diagonal. That keeps all four chains aligned at center.
 */

type ChainDef = {
  id: "tl" | "tr" | "bl" | "br";
  clipPath: string;
  scaleY: 1 | -1;
  from: { x: string; y: string };
  glow: CSSProperties;
};

const CHAINS: ChainDef[] = [
  {
    id: "tl",
    clipPath: "polygon(0 0, 54% 0, 54% 54%, 0 54%)",
    scaleY: -1,
    from: { x: "-24%", y: "-24%" },
    glow: { top: "14%", left: "12%" },
  },
  {
    id: "tr",
    clipPath: "polygon(46% 0, 100% 0, 100% 54%, 46% 54%)",
    scaleY: 1,
    from: { x: "24%", y: "-24%" },
    glow: { top: "14%", right: "12%" },
  },
  {
    id: "bl",
    clipPath: "polygon(0 46%, 54% 46%, 54% 100%, 0 100%)",
    scaleY: 1,
    from: { x: "-24%", y: "24%" },
    glow: { bottom: "14%", left: "12%" },
  },
  {
    id: "br",
    clipPath: "polygon(46% 46%, 100% 46%, 100% 100%, 46% 100%)",
    scaleY: -1,
    from: { x: "24%", y: "24%" },
    glow: { bottom: "14%", right: "12%" },
  },
];

const CHAIN_TRAVEL_S = 1.88;
const IMPACT_DELAY_S = 1.82;

export function TableLockOverlay() {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <div
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/62 backdrop-blur-[1px]"
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(252,211,77,0.22),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(190,18,60,0.28),transparent_42%),linear-gradient(135deg,rgba(0,0,0,0.15),rgba(0,0,0,0.56))]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.28 }}
      />

      {CHAINS.map((chain, index) => (
        <motion.div
          key={chain.id}
          className="pointer-events-none absolute inset-0 z-10 select-none"
          style={{ clipPath: chain.clipPath }}
          initial={
            prefersReducedMotion
              ? false
              : {
                  x: chain.from.x,
                  y: chain.from.y,
                  opacity: 0.24,
                  scale: 1.08,
                }
          }
          animate={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : CHAIN_TRAVEL_S,
            delay: prefersReducedMotion ? 0 : index * 0.025,
            ease: [0.12, 0.82, 0.2, 1],
          }}
        >
          <img
            src="/assets/images/chain-lock-arm.png"
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              transform: chain.scaleY === -1 ? "scaleY(-1)" : undefined,
              filter:
                "drop-shadow(0 7px 18px rgba(0,0,0,0.82)) drop-shadow(0 0 14px rgba(255,255,255,0.24)) saturate(1.12) contrast(1.12)",
            }}
          />
          <motion.span
            className="absolute h-24 w-24 rounded-full bg-amber-200/25 blur-2xl"
            style={chain.glow}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0.18], scale: [0.4, 1.1, 0.72] }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.62,
              delay: prefersReducedMotion ? 0 : index * 0.07,
              ease: "easeOut",
            }}
          />
        </motion.div>
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 z-20 h-[clamp(120px,20vw,230px)] w-[clamp(120px,20vw,230px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/35 bg-black/20 shadow-[0_0_44px_rgba(251,191,36,0.16),inset_0_0_30px_rgba(0,0,0,0.56)]"
        initial={{ opacity: 0, scale: 0.35, rotate: -18 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : IMPACT_DELAY_S - 0.08,
          duration: prefersReducedMotion ? 0 : 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 z-30 h-[clamp(170px,27vw,315px)] w-[clamp(170px,27vw,315px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/30"
        initial={{ opacity: 0, scale: 0.38 }}
        animate={{ opacity: [0, 0.95, 0], scale: [0.38, 1.08, 1.62] }}
        transition={{
          delay: prefersReducedMotion ? 0 : IMPACT_DELAY_S,
          duration: prefersReducedMotion ? 0 : 0.58,
          ease: "easeOut",
        }}
      />

      <motion.div
        className="absolute inset-0 z-40 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.62, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: prefersReducedMotion ? 0 : IMPACT_DELAY_S,
          duration: prefersReducedMotion ? 0 : 0.28,
          ease: [0.2, 1.2, 0.25, 1],
        }}
      >
        <div className="relative h-[clamp(86px,13vw,138px)] w-[clamp(82px,12vw,132px)]">
          <div className="absolute left-1/2 top-0 h-[48%] w-[68%] -translate-x-1/2 rounded-t-full border-[clamp(8px,1.15vw,13px)] border-b-0 border-stone-200 bg-transparent shadow-[0_0_20px_rgba(255,255,255,0.24),inset_0_0_10px_rgba(0,0,0,0.35)]" />
          <motion.div
            className="absolute bottom-0 flex h-[68%] w-full items-center justify-center rounded-[1.05rem] border border-yellow-100/65 bg-[linear-gradient(145deg,#fff2a3_0%,#e2b84b_22%,#b78018_58%,#ffd86b_100%)] shadow-[0_18px_38px_rgba(0,0,0,0.58),inset_0_3px_8px_rgba(255,255,255,0.48),inset_0_-8px_14px_rgba(92,47,0,0.34)]"
            animate={
              prefersReducedMotion
                ? undefined
                : { y: [0, -3, 0], rotate: [0, -1.4, 1.1, 0] }
            }
            transition={{
              delay: IMPACT_DELAY_S + 0.08,
              duration: 0.34,
              ease: "easeOut",
            }}
          >
            <LockKeyhole
              className="h-[38%] w-[38%] text-[#221308] drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
              strokeWidth={3.2}
            />
            <span className="absolute left-[18%] top-[18%] h-[28%] w-[42%] rounded-full bg-white/24 blur-[10px]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
