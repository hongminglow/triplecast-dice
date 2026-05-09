import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LockKeyhole } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * Four chain arms fly along the diagonals from each corner toward the center,
 * striking the lock and forming a large X. Sync this with the 2s chain-lock
 * SFX — chains settle at ~1800ms and the "Game locked" badge reveals just
 * after the strike.
 */

type Corner = {
  id: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  /** Angle the chain along this diagonal (deg), measured from the x-axis. */
  rotation: number;
  /** Translate start point — far outside the stage along the same diagonal. */
  from: { x: string; y: string };
  /** Mirror flags so the chain head always points inward. */
  scaleX: number;
  scaleY: number;
};

const CHAIN_CORNERS: Corner[] = [
  {
    id: "topLeft",
    rotation: 45,
    from: { x: "-120%", y: "-120%" },
    scaleX: 1,
    scaleY: 1,
  },
  {
    id: "topRight",
    rotation: -45,
    from: { x: "120%", y: "-120%" },
    scaleX: -1,
    scaleY: 1,
  },
  {
    id: "bottomLeft",
    rotation: -45,
    from: { x: "-120%", y: "120%" },
    scaleX: 1,
    scaleY: -1,
  },
  {
    id: "bottomRight",
    rotation: 45,
    from: { x: "120%", y: "120%" },
    scaleX: -1,
    scaleY: -1,
  },
];

const CHAIN_TRAVEL_MS = 1800;
const CHAIN_STAGGER_MS = 40;

export function TableLockOverlay() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/30">
      <div className="absolute inset-0 flex items-center justify-center">
        {CHAIN_CORNERS.map((corner, index) => (
          <ChainArm
            key={corner.id}
            corner={corner}
            reducedMotion={Boolean(prefersReducedMotion)}
            delay={index * CHAIN_STAGGER_MS}
          />
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          key="lock-badge"
          className="absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: prefersReducedMotion ? 0 : CHAIN_TRAVEL_MS / 1000 + 0.05,
            type: "spring",
            stiffness: 320,
            damping: 22,
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-red-200/55 bg-[#2a0807]/95 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-100 shadow-[0_0_32px_rgba(248,113,113,0.3)] backdrop-blur">
            <LockKeyhole size={14} />
            Game locked
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type ChainArmProps = {
  corner: Corner;
  reducedMotion: boolean;
  delay: number;
};

function ChainArm({ corner, reducedMotion, delay }: ChainArmProps) {
  // Orient the chain along its diagonal and mirror so the head faces inward.
  const staticStyle: CSSProperties = {
    width: "clamp(220px, 58%, 620px)",
    height: "auto",
    transformOrigin: "center center",
    filter: "drop-shadow(0 0 22px rgba(248,113,113,0.45))",
  };

  if (reducedMotion) {
    return (
      <motion.img
        src="/assets/images/chain-lock-arm.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute"
        style={staticStyle}
        initial={false}
        animate={{
          x: 0,
          y: 0,
          rotate: corner.rotation,
          scaleX: corner.scaleX,
          scaleY: corner.scaleY,
          opacity: 1,
        }}
        transition={{ duration: 0 }}
      />
    );
  }

  return (
    <motion.img
      src="/assets/images/chain-lock-arm.png"
      alt=""
      draggable={false}
      className="pointer-events-none absolute"
      style={staticStyle}
      initial={{
        x: corner.from.x,
        y: corner.from.y,
        rotate: corner.rotation,
        scaleX: corner.scaleX,
        scaleY: corner.scaleY,
        opacity: 0,
      }}
      animate={{
        x: 0,
        y: 0,
        rotate: corner.rotation,
        scaleX: corner.scaleX,
        scaleY: corner.scaleY,
        opacity: [0, 1, 1],
      }}
      transition={{
        duration: CHAIN_TRAVEL_MS / 1000,
        delay: delay / 1000,
        ease: [0.22, 0.68, 0.24, 1],
        opacity: { times: [0, 0.2, 1] },
      }}
    />
  );
}

// end
