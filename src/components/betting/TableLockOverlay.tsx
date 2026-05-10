import { motion } from "motion/react";
import type { CSSProperties } from "react";

type ChainDef = {
  id: "tl" | "tr" | "bl" | "br";
  anchor: CSSProperties;
  transform: string;
  from: { x: string; y: string };
};

const CHAINS: ChainDef[] = [
  {
    id: "tl",
    anchor: { left: 0, top: 0 },
    transform: "scaleY(-1)",
    from: { x: "-38%", y: "-38%" },
  },
  {
    id: "tr",
    anchor: { right: 0, top: 0 },
    transform: "rotate(180deg)",
    from: { x: "38%", y: "-38%" },
  },
  {
    id: "bl",
    anchor: { left: 0, bottom: 0 },
    transform: "none",
    from: { x: "-38%", y: "38%" },
  },
  {
    id: "br",
    anchor: { right: 0, bottom: 0 },
    transform: "rotate(180deg) scaleY(-1)",
    from: { x: "38%", y: "38%" },
  },
];

const CHAIN_TRAVEL_S = 0.5;
const CHAIN_RELEASE_S = 1.05;
const IMPACT_DELAY_S = 0.42;

type TableLockOverlayProps = {
  animateEntrance?: boolean;
};

export function TableLockOverlay({
  animateEntrance = false,
}: TableLockOverlayProps) {
  const shouldAnimate = animateEntrance;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/64 backdrop-blur-[1px]"
      exit={{ opacity: 1 }}
      transition={{ duration: CHAIN_RELEASE_S + 0.08, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(252,211,77,0.18),transparent_23%),radial-gradient(circle_at_50%_50%,rgba(190,18,60,0.26),transparent_42%),linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.6))]"
        initial={shouldAnimate ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldAnimate ? 0.25 : 0 }}
      />

      {CHAINS.map((chain, index) => (
        <motion.div
          key={chain.id}
          className="pointer-events-none absolute z-10 aspect-[1316/721] w-[clamp(340px,50.5%,760px)] select-none"
          style={chain.anchor}
          initial={
            shouldAnimate
              ? {
                  x: chain.from.x,
                  y: chain.from.y,
                  opacity: 0.18,
                  scale: 1.08,
                }
              : false
          }
          animate={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            x: chain.from.x,
            y: chain.from.y,
            opacity: 0.16,
            scale: 1.08,
            transition: {
              duration: CHAIN_RELEASE_S,
              delay: index * 0.02,
              ease: [0.4, 0, 0.2, 1],
            },
          }}
          transition={{
            duration: shouldAnimate ? CHAIN_TRAVEL_S : 0,
            delay: shouldAnimate ? index * 0.025 : 0,
            ease: [0.12, 0.82, 0.2, 1],
          }}
        >
          <img
            src="/assets/images/chain-lock-arm.png"
            alt=""
            draggable={false}
            className="h-full w-full object-contain"
            style={{
              transform: chain.transform,
              filter:
                "drop-shadow(0 8px 18px rgba(0,0,0,0.86)) drop-shadow(0 0 12px rgba(255,255,255,0.2)) saturate(1.08) contrast(1.1)",
            }}
          />
        </motion.div>
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 z-30 h-[clamp(92px,10.5vw,132px)] w-[clamp(86px,9.8vw,124px)] -translate-x-1/2 -translate-y-1/2"
        initial={shouldAnimate ? { opacity: 0, scale: 0.64, y: 10 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: 0.72,
          y: 8,
          transition: { duration: 0.2, ease: "easeIn" },
        }}
        transition={{
          delay: shouldAnimate ? IMPACT_DELAY_S : 0,
          duration: shouldAnimate ? 0.26 : 0,
          ease: [0.2, 1.2, 0.25, 1],
        }}
      >
        <motion.div
          className="relative h-full w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.62)]"
          animate={
            shouldAnimate
              ? { y: [0, -3, 0], rotate: [0, -1.4, 1.1, 0] }
              : undefined
          }
          transition={{
            delay: shouldAnimate ? IMPACT_DELAY_S + 0.08 : 0,
            duration: shouldAnimate ? 0.34 : 0,
            ease: "easeOut",
          }}
        >
          <span className="absolute left-1/2 top-[3%] h-[46%] w-[58%] -translate-x-1/2 rounded-t-full border-[clamp(8px,1vw,13px)] border-b-0 border-[#d8d1be] bg-transparent shadow-[0_0_16px_rgba(255,255,255,0.22),inset_0_0_10px_rgba(0,0,0,0.42)]" />
          <span className="absolute bottom-0 left-0 right-0 h-[66%] rounded-b-[38%] rounded-t-[18%] border border-yellow-100/70 bg-[radial-gradient(circle_at_28%_20%,rgba(255,246,184,0.72),transparent_30%),linear-gradient(145deg,#f7df7b_0%,#d8aa32_42%,#aa7111_72%,#e7b94c_100%)] shadow-[0_0_32px_rgba(245,158,11,0.28),inset_0_4px_9px_rgba(255,255,255,0.42),inset_0_-10px_16px_rgba(82,42,0,0.36)]" />
          <span className="absolute left-1/2 top-[54%] h-[18%] w-[14%] -translate-x-1/2 rounded-full bg-[#201207] shadow-[0_1px_1px_rgba(255,255,255,0.25)]" />
          <span className="absolute left-1/2 top-[66%] h-[19%] w-[7%] -translate-x-1/2 rounded-b-full bg-[#201207]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
