import { motion, useReducedMotion } from "motion/react";
import { LockKeyhole } from "lucide-react";

/**
 * Four chain arms pivot from the container center and point out to each
 * corner, forming a large X that locks the entire bet board. Each chain
 * starts offscreen beyond its corner and flies in along its own diagonal so
 * the strike visually converges on the center lock.
 *
 * Timing is synced to the 2-second chain-lock SFX: arms travel for 1.8s, the
 * "Game locked" badge reveals as the last chain lands.
 */

type CornerId = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type Corner = {
  id: CornerId;
  /** Points the chain from the center out to its corner (degrees). */
  rotation: number;
  /** Offscreen start offset along the corner's diagonal (container-relative %). */
  fromX: string;
  fromY: string;
};

const CHAIN_CORNERS: Corner[] = [
  { id: "topLeft", rotation: 225, fromX: "-60%", fromY: "-60%" },
  { id: "topRight", rotation: 315, fromX: "60%", fromY: "-60%" },
  { id: "bottomLeft", rotation: 135, fromX: "-60%", fromY: "60%" },
  { id: "bottomRight", rotation: 45, fromX: "60%", fromY: "60%" },
];

const CHAIN_TRAVEL_S = 1.8;
const CHAIN_STAGGER_S = 0.05;

export function TableLockOverlay() {
  const prefersReducedMotion = Boolean(useReducedMotion());

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/35 backdrop-blur-[1px]">
      {CHAIN_CORNERS.map((corner, index) => (
        <ChainArm
          key={corner.id}
          corner={corner}
          reducedMotion={prefersReducedMotion}
          delay={index * CHAIN_STAGGER_S}
        />
      ))}

      <motion.div
        className="absolute inset-0 z-30 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : CHAIN_TRAVEL_S + 0.05,
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
    </div>
  );
}

type ChainArmProps = {
  corner: Corner;
  reducedMotion: boolean;
  delay: number;
};

function ChainArm({ corner, reducedMotion, delay }: ChainArmProps) {
  /*
   * Anchor the chain at the container center via `top: 50%; left: 50%`. The
   * transform-origin at the image's left edge + vertical middle means that
   * after rotation, the chain extends radially outward toward its corner.
   * Width is sized relative to the container so the diagonal is covered
   * edge-to-edge on any reasonable table size.
   */
  return (
    <motion.img
      src="/assets/images/chain-lock-arm.png"
      alt=""
      draggable={false}
      className="pointer-events-none absolute left-1/2 top-1/2 select-none"
      style={{
        width: "70%",
        maxWidth: 640,
        minWidth: 220,
        height: "auto",
        transformOrigin: "0% 50%",
        filter: "drop-shadow(0 0 22px rgba(248,113,113,0.45))",
      }}
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              x: corner.fromX,
              y: corner.fromY,
              rotate: corner.rotation,
            }
      }
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        rotate: corner.rotation,
      }}
      transition={{
        duration: reducedMotion ? 0 : CHAIN_TRAVEL_S,
        delay: reducedMotion ? 0 : delay,
        ease: [0.22, 0.68, 0.24, 1],
      }}
    />
  );
}
