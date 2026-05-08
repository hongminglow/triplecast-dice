import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import {
  Dices,
  History,
  LockKeyhole,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MathUtils } from "three";
import type { Group } from "three";

type GamePhase =
  | "idle"
  | "rolling"
  | "countdown"
  | "lockdown"
  | "reveal"
  | "settling";
type DieValue = 1 | 2 | 3 | 4 | 5 | 6;
type DiceResult = [DieValue, DieValue, DieValue];
type BetGroup = "Quick Bets" | "Totals" | "Singles" | "Doubles" | "Triples";
type BetKind =
  | "small"
  | "big"
  | "odd"
  | "even"
  | "single"
  | "anyDouble"
  | "specificDouble"
  | "anyTriple"
  | "specificTriple"
  | "exactTotal";

type BetOption = {
  id: string;
  label: string;
  group: BetGroup;
  description: string;
  payoutLabel: string;
  kind: BetKind;
  target?: number;
};

type PlacedBet = {
  id: string;
  option: BetOption;
  stake: number;
};

type BetOutcome = {
  bet: PlacedBet;
  didWin: boolean;
  multiplier: number;
  payout: number;
  profit: number;
};

type PayoutSummary = {
  totalStake: number;
  totalPayout: number;
  net: number;
  outcomes: BetOutcome[];
};

type RoundRecord = {
  round: number;
  result: DiceResult;
  total: number;
  betCount: number;
  totalStake: number;
  totalPayout: number;
  net: number;
};

const STARTING_BALANCE = 5000;
const IDLE_SECONDS = 5;
const ROLLING_SECONDS = 10;
const COUNTDOWN_SECONDS = 60;
const LOCKDOWN_SECONDS = 4;
const REVEAL_SECONDS = 3;
const SETTLE_SECONDS = 5;
const CHIP_VALUES = [10, 50, 100, 500, 1000];
const BET_GROUPS: BetGroup[] = [
  "Quick Bets",
  "Totals",
  "Singles",
  "Doubles",
  "Triples",
];
const DIE_VALUES: DieValue[] = [1, 2, 3, 4, 5, 6];

const exactTotalPayouts: Record<number, number> = {
  4: 60,
  5: 30,
  6: 18,
  7: 12,
  8: 8,
  9: 6,
  10: 5,
  11: 5,
  12: 6,
  13: 8,
  14: 12,
  15: 18,
  16: 30,
  17: 60,
};

const numberFormatter = new Intl.NumberFormat("en-US");

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function createBetOptions(): BetOption[] {
  const quickBets: BetOption[] = [
    {
      id: "small",
      label: "Small",
      group: "Quick Bets",
      description: "4-10, no triples.",
      payoutLabel: "1:1",
      kind: "small",
    },
    {
      id: "big",
      label: "Big",
      group: "Quick Bets",
      description: "11-17, no triples.",
      payoutLabel: "1:1",
      kind: "big",
    },
    {
      id: "odd",
      label: "Odd",
      group: "Quick Bets",
      description: "Odd total.",
      payoutLabel: "1:1",
      kind: "odd",
    },
    {
      id: "even",
      label: "Even",
      group: "Quick Bets",
      description: "Even total.",
      payoutLabel: "1:1",
      kind: "even",
    },
  ];

  const totals = Array.from({ length: 14 }, (_, index) => {
    const total = index + 4;
    return {
      id: `total-${total}`,
      label: `${total}`,
      group: "Totals" as const,
      description:
        total <= 5 || total >= 16 ? "Rare edge hit." : "Hit this total.",
      payoutLabel: `${exactTotalPayouts[total]}:1`,
      kind: "exactTotal" as const,
      target: total,
    };
  });

  const singles = DIE_VALUES.map((value) => ({
    id: `single-${value}`,
    label: `Single ${value}`,
    group: "Singles" as const,
    description: "Pays per match.",
    payoutLabel: "1x-3x",
    kind: "single" as const,
    target: value,
  }));

  const doubles: BetOption[] = [
    {
      id: "any-double",
      label: "Any double",
      group: "Doubles",
      description: "Any pair.",
      payoutLabel: "3:1",
      kind: "anyDouble",
    },
    ...DIE_VALUES.map((value) => ({
      id: `double-${value}`,
      label: `${value}-${value}`,
      group: "Doubles" as const,
      description: `Pair of ${value}.`,
      payoutLabel: "8:1",
      kind: "specificDouble" as const,
      target: value,
    })),
  ];

  const triples: BetOption[] = [
    {
      id: "any-triple",
      label: "Any triple",
      group: "Triples",
      description: "Any triple.",
      payoutLabel: "24:1",
      kind: "anyTriple",
    },
    ...DIE_VALUES.map((value) => ({
      id: `triple-${value}`,
      label: `${value}-${value}-${value}`,
      group: "Triples" as const,
      description: `Triple ${value}.`,
      payoutLabel: "150:1",
      kind: "specificTriple" as const,
      target: value,
    })),
  ];

  return [...quickBets, ...totals, ...singles, ...doubles, ...triples];
}

const BET_OPTIONS = createBetOptions();

function formatCredits(value: number) {
  return numberFormatter.format(value);
}

function getBetTheme(option: BetOption) {
  if (option.kind === "small") {
    return {
      rail: "bg-emerald-300",
      card: "border-emerald-200/30 bg-gradient-to-br from-emerald-500/24 via-[#11291f] to-[#07110d] text-emerald-50 hover:border-emerald-100/70 hover:shadow-emerald-300/25",
      badge: "bg-emerald-200 text-emerald-950",
    };
  }

  if (option.kind === "big") {
    return {
      rail: "bg-rose-300",
      card: "border-rose-200/30 bg-gradient-to-br from-rose-500/24 via-[#301417] to-[#100707] text-rose-50 hover:border-rose-100/70 hover:shadow-rose-300/25",
      badge: "bg-rose-200 text-rose-950",
    };
  }

  if (option.kind === "odd") {
    return {
      rail: "bg-fuchsia-300",
      card: "border-fuchsia-200/30 bg-gradient-to-br from-fuchsia-500/24 via-[#29152f] to-[#0c0710] text-fuchsia-50 hover:border-fuchsia-100/70 hover:shadow-fuchsia-300/25",
      badge: "bg-fuchsia-200 text-fuchsia-950",
    };
  }

  if (option.kind === "even") {
    return {
      rail: "bg-cyan-300",
      card: "border-cyan-200/30 bg-gradient-to-br from-cyan-500/24 via-[#102832] to-[#061014] text-cyan-50 hover:border-cyan-100/70 hover:shadow-cyan-300/25",
      badge: "bg-cyan-200 text-cyan-950",
    };
  }

  if (option.kind === "single") {
    return {
      rail: "bg-lime-300",
      card: "border-lime-200/25 bg-gradient-to-br from-lime-400/18 via-[#1f2910] to-[#090f06] text-lime-50 hover:border-lime-100/60 hover:shadow-lime-300/20",
      badge: "bg-lime-200 text-lime-950",
    };
  }

  if (option.kind === "anyDouble" || option.kind === "specificDouble") {
    return {
      rail: "bg-amber-300",
      card: "border-amber-200/28 bg-gradient-to-br from-amber-400/20 via-[#2d210d] to-[#110b05] text-amber-50 hover:border-amber-100/70 hover:shadow-amber-300/24",
      badge: "bg-amber-200 text-amber-950",
    };
  }

  if (option.kind === "anyTriple" || option.kind === "specificTriple") {
    return {
      rail: "bg-pink-300",
      card: "border-pink-200/28 bg-gradient-to-br from-pink-500/22 via-[#311126] to-[#120711] text-pink-50 hover:border-pink-100/70 hover:shadow-pink-300/24",
      badge: "bg-pink-200 text-pink-950",
    };
  }

  const edgeTotal =
    option.target === 4 ||
    option.target === 5 ||
    option.target === 16 ||
    option.target === 17;
  return {
    rail: edgeTotal ? "bg-yellow-200" : "bg-sky-300",
    card: edgeTotal
      ? "border-yellow-200/30 bg-gradient-to-br from-yellow-300/20 via-[#2d260d] to-[#111006] text-yellow-50 hover:border-yellow-100/70 hover:shadow-yellow-300/24"
      : "border-sky-200/25 bg-gradient-to-br from-sky-400/18 via-[#112239] to-[#061019] text-sky-50 hover:border-sky-100/60 hover:shadow-sky-300/20",
    badge: edgeTotal
      ? "bg-yellow-100 text-yellow-950"
      : "bg-sky-200 text-sky-950",
  };
}

function randomDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue;
}

function randomDice(): DiceResult {
  return [randomDie(), randomDie(), randomDie()];
}

function totalDice(result: DiceResult) {
  return result[0] + result[1] + result[2];
}

function getCounts(result: DiceResult) {
  return DIE_VALUES.map(
    (value) => result.filter((die) => die === value).length,
  );
}

function hasTriple(result: DiceResult) {
  return result[0] === result[1] && result[1] === result[2];
}

function countTarget(result: DiceResult, target: number) {
  return result.filter((die) => die === target).length;
}

function evaluateBet(option: BetOption, result: DiceResult) {
  const total = totalDice(result);
  const counts = getCounts(result);
  const triple = hasTriple(result);

  switch (option.kind) {
    case "small":
      return !triple && total >= 4 && total <= 10 ? 1 : 0;
    case "big":
      return !triple && total >= 11 && total <= 17 ? 1 : 0;
    case "odd":
      return total % 2 === 1 ? 1 : 0;
    case "even":
      return total % 2 === 0 ? 1 : 0;
    case "single":
      return option.target ? countTarget(result, option.target) : 0;
    case "anyDouble":
      return counts.some((count) => count >= 2) ? 3 : 0;
    case "specificDouble":
      return option.target && countTarget(result, option.target) >= 2 ? 8 : 0;
    case "anyTriple":
      return triple ? 24 : 0;
    case "specificTriple":
      return option.target && countTarget(result, option.target) === 3
        ? 150
        : 0;
    case "exactTotal":
      return option.target === total ? (exactTotalPayouts[total] ?? 0) : 0;
  }
}

function settleBets(bets: PlacedBet[], result: DiceResult): PayoutSummary {
  const outcomes = bets.map((bet) => {
    const multiplier = evaluateBet(bet.option, result);
    const didWin = multiplier > 0;
    const profit = didWin ? bet.stake * multiplier : -bet.stake;
    const payout = didWin ? bet.stake + bet.stake * multiplier : 0;
    return { bet, didWin, multiplier, payout, profit };
  });
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalPayout = outcomes.reduce(
    (sum, outcome) => sum + outcome.payout,
    0,
  );

  return {
    totalStake,
    totalPayout,
    net: totalPayout - totalStake,
    outcomes,
  };
}

function createRoundRecord(
  round: number,
  result: DiceResult,
  summary: PayoutSummary,
): RoundRecord {
  return {
    round,
    result,
    total: totalDice(result),
    betCount: summary.outcomes.length,
    totalStake: summary.totalStake,
    totalPayout: summary.totalPayout,
    net: summary.net,
  };
}

function getBetId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function playCountdownTick() {
  try {
    const audio = new Audio("/assets/countdown-chime.mp3");
    audio.volume = 0.45;
    void audio.play();
  } catch (error) {
    void error;
  }
}

function pipPositions(value: DieValue) {
  const near = 0.28;
  const far = -0.28;
  const center = 0;
  const positions: Record<DieValue, Array<[number, number]>> = {
    1: [[center, center]],
    2: [
      [far, near],
      [near, far],
    ],
    3: [
      [far, near],
      [center, center],
      [near, far],
    ],
    4: [
      [far, near],
      [near, near],
      [far, far],
      [near, far],
    ],
    5: [
      [far, near],
      [near, near],
      [center, center],
      [far, far],
      [near, far],
    ],
    6: [
      [far, near],
      [near, near],
      [far, center],
      [near, center],
      [far, far],
      [near, far],
    ],
  };
  return positions[value];
}

const faceRotations: Record<DieValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [Math.PI / 2, 0, 0],
  3: [0, -Math.PI / 2, 0],
  4: [0, Math.PI / 2, 0],
  5: [-Math.PI / 2, 0, 0],
  6: [0, Math.PI, 0],
};

type PipFace = {
  value: DieValue;
  rotation: [number, number, number];
  position: (x: number, y: number) => [number, number, number];
};

const pipFaces: PipFace[] = [
  { value: 1, rotation: [0, 0, 0], position: (x, y) => [x, y, 0.584] },
  { value: 6, rotation: [0, Math.PI, 0], position: (x, y) => [-x, y, -0.584] },
  {
    value: 3,
    rotation: [0, Math.PI / 2, 0],
    position: (x, y) => [0.584, y, -x],
  },
  {
    value: 4,
    rotation: [0, -Math.PI / 2, 0],
    position: (x, y) => [-0.584, y, x],
  },
  {
    value: 2,
    rotation: [-Math.PI / 2, 0, 0],
    position: (x, y) => [x, 0.584, -y],
  },
  {
    value: 5,
    rotation: [Math.PI / 2, 0, 0],
    position: (x, y) => [x, -0.584, y],
  },
];

function DiePips() {
  return (
    <>
      {pipFaces.map((face) =>
        pipPositions(face.value).map(([x, y], index) => (
          <mesh
            key={`${face.value}-${index}`}
            position={face.position(x, y)}
            rotation={face.rotation}
          >
            <circleGeometry args={[0.075, 24]} />
            <meshStandardMaterial
              color="#16120c"
              roughness={0.5}
              metalness={0.05}
            />
          </mesh>
        )),
      )}
    </>
  );
}

function DiceModel({
  value,
  phase,
  position,
  index,
}: {
  value: DieValue;
  phase: GamePhase;
  position: [number, number, number];
  index: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const isRolling = phase === "rolling";
    const speed = 5.2;
    const bob = isRolling
      ? Math.sin(state.clock.elapsedTime * 2.8 + index) * 0.08
      : 0;

    groupRef.current.position.y = MathUtils.damp(
      groupRef.current.position.y,
      position[1] + bob,
      8,
      delta,
    );

    if (isRolling) {
      groupRef.current.rotation.x += delta * speed * (1.1 + index * 0.12);
      groupRef.current.rotation.y += delta * speed * (0.82 + index * 0.1);
      groupRef.current.rotation.z += delta * speed * 0.55;
      return;
    }

    const target = faceRotations[value];
    groupRef.current.rotation.x = MathUtils.damp(
      groupRef.current.rotation.x,
      target[0],
      8,
      delta,
    );
    groupRef.current.rotation.y = MathUtils.damp(
      groupRef.current.rotation.y,
      target[1],
      8,
      delta,
    );
    groupRef.current.rotation.z = MathUtils.damp(
      groupRef.current.rotation.z,
      target[2],
      8,
      delta,
    );
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={phase === "reveal" ? 1.42 : 1.32}
    >
      <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.13} smoothness={7}>
        <meshStandardMaterial
          color="#fff6df"
          roughness={0.34}
          metalness={0.08}
          emissive="#2d1a08"
          emissiveIntensity={0.03}
        />
      </RoundedBox>
      <DiePips />
    </group>
  );
}

function CasinoCover({ phase }: { phase: GamePhase }) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const pulse =
      phase === "lockdown" ? Math.sin(state.clock.elapsedTime * 5) * 0.035 : 0;
    groupRef.current.position.y = MathUtils.damp(
      groupRef.current.position.y,
      0.38 + pulse,
      7,
      delta,
    );
    groupRef.current.rotation.y = MathUtils.damp(
      groupRef.current.rotation.y,
      phase === "lockdown" ? 0.05 : 0,
      6,
      delta,
    );
  });

  return (
    <group ref={groupRef} position={[0, 0.38, 0]} scale={[2.65, 1.08, 0.86]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.48, 1.92, 1.62, 64, 1, false]} />
        <meshStandardMaterial
          color="#4a2116"
          roughness={0.5}
          metalness={0.18}
          emissive={phase === "lockdown" ? "#4a0808" : "#1e1208"}
          emissiveIntensity={phase === "lockdown" ? 0.22 : 0.1}
        />
      </mesh>
      <mesh
        position={[0, -0.76, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.78]}
      >
        <torusGeometry args={[1.72, 0.055, 16, 64]} />
        <meshStandardMaterial
          color="#d4a84c"
          roughness={0.3}
          metalness={0.75}
        />
      </mesh>
      <mesh
        position={[0, 0.74, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 1, 0.78]}
      >
        <torusGeometry args={[1.27, 0.055, 16, 64]} />
        <meshStandardMaterial
          color="#f0c35c"
          roughness={0.28}
          metalness={0.8}
        />
      </mesh>
      <RoundedBox
        args={[0.62, 0.18, 0.34]}
        radius={0.08}
        smoothness={5}
        position={[0, 0.91, 0]}
      >
        <meshStandardMaterial
          color="#f0c35c"
          roughness={0.28}
          metalness={0.82}
        />
      </RoundedBox>
    </group>
  );
}

function DiceStage({
  phase,
  result,
  secondsLeft,
  winning,
}: {
  phase: GamePhase;
  result: DiceResult;
  secondsLeft: number;
  winning: boolean;
}) {
  const [displayValues, setDisplayValues] = useState<DiceResult>(result);
  const visibleValues = phase === "rolling" ? displayValues : result;
  const diceClosed = phase === "countdown" || phase === "lockdown";
  const showCountdown = phase === "countdown";
  const urgentCountdown = showCountdown && secondsLeft <= 10;
  const showResultOverlay = phase === "reveal" || phase === "settling";
  const resultTotal = totalDice(result);

  useEffect(() => {
    if (phase === "rolling") {
      const interval = window.setInterval(
        () => setDisplayValues(randomDice()),
        120,
      );
      return () => window.clearInterval(interval);
    }
  }, [phase]);

  return (
    <div className="relative h-full min-h-[132px] overflow-hidden rounded-[1.5rem] border border-amber-200/25 bg-[radial-gradient(circle_at_36%_5%,rgba(251,191,36,0.28),transparent_24%),radial-gradient(circle_at_75%_30%,rgba(16,185,129,0.22),transparent_25%),linear-gradient(145deg,#08150f,#172016_45%,#080403)] shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
      <div className="absolute inset-x-5 top-3 z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-100/70">
        <span>Live dice feed</span>
      </div>
      {showCountdown && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={cx(
              "grid h-24 w-24 place-items-center rounded-full border bg-black/45 text-5xl font-black leading-none shadow-2xl backdrop-blur-sm transition",
              urgentCountdown
                ? "animate-[countdownPunch_1s_ease-in-out_infinite] border-red-300 text-red-200 shadow-red-500/30"
                : "border-emerald-200/40 text-emerald-100 shadow-emerald-400/20",
            )}
            aria-label={`${secondsLeft} seconds remaining`}
          >
            {secondsLeft}
          </div>
        </div>
      )}
      {showResultOverlay && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/20 px-4 backdrop-blur-[1px]">
          <div
            className={cx(
              "rounded-[1.4rem] border px-5 py-3 text-center shadow-2xl backdrop-blur-md sm:px-8",
              winning
                ? "border-amber-100/60 bg-amber-300/18 shadow-amber-300/25"
                : "border-white/20 bg-black/45 shadow-black/50",
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-100/80">
              Result is
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
              {result.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-amber-100/40 bg-[#fff7df] text-2xl font-black text-[#170d06] shadow-lg shadow-black/30 sm:h-14 sm:w-14 sm:text-3xl"
                >
                  {value}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-100/80">
              Total {resultTotal}
            </p>
          </div>
        </div>
      )}
      <Canvas camera={{ position: [0, 2.05, 5.35], fov: 36 }} shadows>
        <color attach="background" args={["#06100d"]} />
        <ambientLight intensity={0.8} />
        <spotLight
          position={[0, 5.5, 3.2]}
          angle={0.48}
          penumbra={0.8}
          intensity={3.2}
          castShadow
        />
        <pointLight position={[-4, 2, 4]} intensity={3} color="#f0b35b" />
        <pointLight position={[4, 2, 3]} intensity={2.4} color="#4ade80" />
        <group rotation={[-0.18, 0, 0]}>
          {!diceClosed && (
            <>
              <DiceModel
                value={visibleValues[0]}
                phase={phase}
                position={[-2.55, 0.1, 0]}
                index={0}
              />
              <DiceModel
                value={visibleValues[1]}
                phase={phase}
                position={[0, 0.15, 0.06]}
                index={1}
              />
              <DiceModel
                value={visibleValues[2]}
                phase={phase}
                position={[2.55, 0.1, 0]}
                index={2}
              />
            </>
          )}
          {diceClosed && <CasinoCover phase={phase} />}
        </group>
        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.72, 0]}
        >
          <planeGeometry args={[8.5, 4]} />
          <meshStandardMaterial
            color="#073d2b"
            roughness={0.88}
            metalness={0.02}
          />
        </mesh>
        <ContactShadows
          position={[0, -0.7, 0]}
          opacity={0.5}
          scale={6}
          blur={2.6}
          far={3}
        />
        {winning && (
          <Sparkles
            count={90}
            speed={0.8}
            opacity={0.85}
            color="#f7c76b"
            size={4}
            scale={[5.5, 2.5, 2.5]}
            position={[0, 0.25, 0]}
          />
        )}
        <Environment preset="night" />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

function App() {
  const [nickname, setNickname] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [roundNumber, setRoundNumber] = useState(1);
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(IDLE_SECONDS);
  const [selectedChip, setSelectedChip] = useState(100);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [result, setResult] = useState<DiceResult>(() => randomDice());
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const betsRef = useRef(bets);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const historyPopoverRef = useRef<HTMLDivElement>(null);
  const rollingAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTickSecondRef = useRef<number | null>(null);

  const groupedOptions = useMemo(
    () =>
      BET_GROUPS.map((group) => ({
        group,
        options: BET_OPTIONS.filter((option) => option.group === group),
      })),
    [],
  );

  const totalStaked = useMemo(
    () => bets.reduce((sum, bet) => sum + bet.stake, 0),
    [bets],
  );
  const canBet = Boolean(nickname) && phase === "countdown";
  const hasWon = Boolean(summary && summary.totalPayout > 0);
  const resultTotal = totalDice(result);

  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  useEffect(() => {
    if (!isHistoryOpen) return;

    function handleOutsideDismiss(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        historyPopoverRef.current?.contains(target) ||
        historyButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsHistoryOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHistoryOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideDismiss);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideDismiss);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHistoryOpen]);

  useEffect(() => {
    if (!nickname || phase !== "countdown" || secondsLeft !== 10) {
      if (phase !== "countdown") {
        lastTickSecondRef.current = null;
      }
      return;
    }

    if (lastTickSecondRef.current === secondsLeft) return;

    lastTickSecondRef.current = secondsLeft;
    playCountdownTick();
  }, [nickname, phase, secondsLeft]);

  useEffect(() => {
    if (!nickname || phase !== "rolling") {
      rollingAudioRef.current?.pause();
      rollingAudioRef.current = null;
      return;
    }

    const audio = new Audio("/assets/dice-shake.mp3");
    audio.volume = 0.38;
    audio.loop = true;
    rollingAudioRef.current = audio;
    void audio.play().catch(() => undefined);

    return () => {
      audio.pause();
      rollingAudioRef.current = null;
    };
  }, [nickname, phase]);

  useEffect(() => {
    if (!nickname) return;

    const timeout = window.setTimeout(() => {
      if (phase === "idle") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("rolling");
        setSecondsLeft(ROLLING_SECONDS);
        setBets([]);
        setSummary(null);
        setResult(randomDice());
        return;
      }

      if (phase === "rolling") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setResult(randomDice());
        setPhase("countdown");
        setSecondsLeft(COUNTDOWN_SECONDS);
        return;
      }

      if (phase === "countdown") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("lockdown");
        setSecondsLeft(LOCKDOWN_SECONDS);
        return;
      }

      if (phase === "lockdown") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        const nextResult = result;
        const activeBets = betsRef.current;
        const nextSummary = settleBets(activeBets, nextResult);
        setResult(nextResult);
        setSummary(nextSummary);
        setBalance((current) => current + nextSummary.totalPayout);
        setHistory((current) =>
          [
            createRoundRecord(roundNumber, nextResult, nextSummary),
            ...current,
          ].slice(0, 8),
        );
        setPhase("reveal");
        setSecondsLeft(REVEAL_SECONDS);
        return;
      }

      if (phase === "reveal") {
        if (secondsLeft > 1) {
          setSecondsLeft((current) => current - 1);
          return;
        }
        setPhase("settling");
        setSecondsLeft(SETTLE_SECONDS);
        return;
      }

      if (secondsLeft > 1) {
        setSecondsLeft((current) => current - 1);
        return;
      }

      setRoundNumber((current) => current + 1);
      setPhase("idle");
      setSecondsLeft(IDLE_SECONDS);
      setBets([]);
      setSummary(null);
      setResult(randomDice());
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [nickname, phase, result, roundNumber, secondsLeft]);

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = nameDraft.trim().slice(0, 18);
    if (!cleanName) return;
    setNickname(cleanName);
    setNameDraft(cleanName);
  }

  function placeBet(option: BetOption) {
    if (!canBet || balance < selectedChip) return;
    const placedBet: PlacedBet = {
      id: getBetId(),
      option,
      stake: selectedChip,
    };
    setBets((current) => [...current, placedBet]);
    setBalance((current) => current - selectedChip);
  }

  function removeBet(betId: string) {
    if (!canBet) return;

    const targetBet = bets.find((bet) => bet.id === betId);
    if (!targetBet) return;

    setBets((current) => current.filter((bet) => bet.id !== betId));
    setBalance((current) => current + targetBet.stake);
  }

  return (
    <main className="h-[100svh] overflow-x-hidden overflow-y-auto bg-[#050403] text-stone-100 lg:overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(245,158,11,0.28),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(244,63,94,0.2),transparent_25%),radial-gradient(circle_at_54%_108%,rgba(16,185,129,0.24),transparent_38%),linear-gradient(135deg,#140604,#06140e_50%,#190d03)]" />

      <section className="mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col gap-2 px-2 py-2 sm:px-3 lg:h-[100svh] lg:px-4">
        <header className="relative z-50 flex flex-col gap-2 rounded-[1.35rem] border border-amber-100/14 bg-[#100805]/70 p-2 shadow-2xl shadow-black/30 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-100 ring-1 ring-amber-100/25">
              <Dices size={23} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-100/60">
                Three Dice Studio
              </p>
              <h1 className="text-base font-black tracking-normal text-white sm:text-xl">
                Broadcast Dice Table
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
              <p className="font-bold text-emerald-100">
                {formatCredits(balance)}
              </p>
            </div>
            <div className="min-w-[96px] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-1.5 md:flex-none">
              <p className="text-xs text-stone-400">Round</p>
              <p className="font-bold text-white">#{roundNumber}</p>
            </div>
            <div className="relative">
              <button
                ref={historyButtonRef}
                type="button"
                onClick={() => setIsHistoryOpen((current) => !current)}
                className="relative flex h-full min-h-[52px] min-w-[52px] cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-amber-100 transition hover:border-amber-200/40 hover:bg-amber-300/10"
                aria-label="Show game history"
                aria-expanded={isHistoryOpen}
              >
                <History size={22} />
                {history.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-xs font-black text-black">
                    {history.length}
                  </span>
                )}
              </button>

              {isHistoryOpen && (
                <div
                  ref={historyPopoverRef}
                  className="absolute right-0 top-full z-40 mt-3 w-[min(88vw,360px)] rounded-[1.35rem] bg-[#07100d]/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.62),inset_0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        Game history
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(false)}
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
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-2">
          <section className="flex min-h-0 min-w-0 flex-col gap-4">
            <div className="h-[17vh] min-h-[112px] max-h-[150px] rounded-[1.55rem] bg-black/25 shadow-2xl shadow-black/40">
              <DiceStage
                phase={phase}
                result={result}
                secondsLeft={secondsLeft}
                winning={hasWon && (phase === "reveal" || phase === "settling")}
              />
            </div>

            <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[minmax(0,1fr)_286px]">
              <div className="relative min-h-0 overflow-hidden rounded-[1.35rem] bg-white/[0.045] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(251,191,36,0.08)]">
                <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-base font-black text-white">
                      Bet board
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CHIP_VALUES.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSelectedChip(chip)}
                        className={cx(
                          "min-h-7 cursor-pointer rounded-full border px-3 text-xs font-black transition",
                          selectedChip === chip
                            ? "border-amber-200 bg-amber-300 text-black shadow-lg shadow-amber-300/20"
                            : "border-white/10 bg-black/35 text-stone-200 hover:border-amber-200/50",
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {!canBet && (
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[1.35rem] bg-black/20">
                    {["topLeft", "topRight", "bottomLeft", "bottomRight"].map(
                      (corner) => (
                        <img
                          key={corner}
                          src="/assets/chain-lock-arm.png"
                          alt=""
                          className={cx(
                            "lock-chain-arm absolute opacity-0 drop-shadow-[0_0_18px_rgba(245,158,11,0.28)]",
                            corner === "topLeft" && "lock-chain-arm--top-left",
                            corner === "topRight" &&
                              "lock-chain-arm--top-right",
                            corner === "bottomLeft" &&
                              "lock-chain-arm--bottom-left",
                            corner === "bottomRight" &&
                              "lock-chain-arm--bottom-right",
                          )}
                          draggable={false}
                        />
                      ),
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="lock-center-badge inline-flex items-center gap-2 rounded-full border border-red-200/55 bg-[#2a0807]/95 px-5 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-100 shadow-[0_0_32px_rgba(248,113,113,0.3)] backdrop-blur">
                        <LockKeyhole size={14} />
                        Table locked
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {groupedOptions.map(({ group, options }) => (
                    <section key={group}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">
                          {group}
                        </h3>
                      </div>
                      <div
                        className={cx(
                          "grid gap-1",
                          group === "Quick Bets" &&
                            "grid-cols-2 sm:grid-cols-4",
                          group === "Totals" &&
                            "grid-cols-7 xl:grid-cols-[repeat(14,minmax(0,1fr))]",
                          group === "Singles" && "grid-cols-3 sm:grid-cols-6",
                          (group === "Doubles" || group === "Triples") &&
                            "grid-cols-3 sm:grid-cols-7",
                        )}
                      >
                        {options.map((option) => {
                          const disabled = !canBet || balance < selectedChip;
                          const theme = getBetTheme(option);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => placeBet(option)}
                              className={cx(
                                "group min-h-[30px] rounded-lg border p-1 text-left shadow-lg transition duration-200",
                                disabled
                                  ? "cursor-not-allowed border-white/5 bg-white/[0.025] text-stone-500"
                                  : cx(
                                      "cursor-pointer hover:-translate-y-0.5 focus-visible:-translate-y-0.5",
                                      theme.card,
                                    ),
                              )}
                            >
                              <span
                                className={cx(
                                  "mb-0.5 block h-0.5 w-7 rounded-full",
                                  disabled ? "bg-white/10" : theme.rail,
                                )}
                              />
                              <span className="block text-[11px] font-black leading-tight text-white group-disabled:text-stone-500">
                                {option.label}
                              </span>
                              <span className="mt-0.5 hidden text-[11px] leading-snug text-stone-400 2xl:block">
                                {option.description}
                              </span>
                              <span
                                className={cx(
                                  "mt-0.5 inline-flex rounded-full px-1.5 py-0 text-[9px] font-black",
                                  disabled
                                    ? "bg-white/5 text-stone-500"
                                    : theme.badge,
                                )}
                              >
                                {option.payoutLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <aside className="flex min-h-0 flex-col gap-2">
                <section
                  className={cx(
                    "rounded-[1.35rem] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]",
                    summary
                      ? hasWon
                        ? "animate-[winPulse_900ms_ease-out] bg-amber-300/12"
                        : "bg-white/[0.05]"
                      : "bg-white/[0.05]",
                  )}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-100/60">
                        Result
                      </p>
                      <h2 className="text-base font-black text-white">
                        Round summary
                      </h2>
                    </div>
                    <Trophy
                      className={hasWon ? "text-amber-200" : "text-stone-500"}
                    />
                  </div>

                  {summary ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-2xl bg-black/30 p-2.5">
                        <span className="text-sm text-stone-400">Dice</span>
                        <span className="text-lg font-black text-white">
                          {result.join(" + ")} = {resultTotal}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-2xl bg-black/25 p-2.5">
                          <p className="text-stone-400">Staked</p>
                          <p className="font-black">
                            {formatCredits(summary.totalStake)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-black/25 p-2.5">
                          <p className="text-stone-400">Paid</p>
                          <p className="font-black text-emerald-100">
                            {formatCredits(summary.totalPayout)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cx(
                          "rounded-2xl p-2.5 text-center text-base font-black",
                          summary.net > 0
                            ? "bg-amber-300 text-black"
                            : "bg-white/[0.05] text-stone-300",
                        )}
                      >
                        {summary.net > 0
                          ? `Won +${formatCredits(summary.net)}`
                          : summary.net < 0
                            ? `Lost ${formatCredits(Math.abs(summary.net))}`
                            : "No net change"}
                      </p>
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-black/25 p-2.5 text-sm leading-6 text-stone-400">
                      Bets open only during countdown while the casino cover is
                      closed. The dice reveal after lockdown.
                    </p>
                  )}
                </section>

                <section className="min-h-0 rounded-[1.35rem] bg-white/[0.05] p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.28),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/60">
                        Slip
                      </p>
                      <h2 className="text-base font-black text-white">
                        Current bets
                      </h2>
                    </div>
                    <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100">
                      {formatCredits(totalStaked)}
                    </span>
                  </div>

                  <div className="max-h-[27vh] space-y-2 overflow-y-auto pr-1">
                    {bets.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-white/10 p-3 text-sm text-stone-500">
                        Your bet slip is empty.
                      </p>
                    ) : (
                      bets.map((bet) => {
                        const outcome = summary?.outcomes.find(
                          (item) => item.bet.id === bet.id,
                        );
                        return (
                          <div
                            key={bet.id}
                            className={cx(
                              "flex items-center justify-between gap-3 rounded-2xl border p-2.5",
                              outcome?.didWin
                                ? "border-amber-200/35 bg-amber-300/10"
                                : outcome
                                  ? "border-white/5 bg-black/25 opacity-60"
                                  : "border-white/10 bg-black/25",
                            )}
                          >
                            <div className="min-w-0">
                              <p className="truncate font-bold text-white">
                                {bet.option.label}
                              </p>
                              <p className="text-xs text-stone-400">
                                Stake {formatCredits(bet.stake)} -{" "}
                                {bet.option.payoutLabel}
                              </p>
                            </div>
                            {canBet ? (
                              <button
                                type="button"
                                onClick={() => removeBet(bet.id)}
                                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-stone-300 transition hover:border-red-300/50 hover:text-red-200"
                                aria-label={`Remove ${bet.option.label}`}
                              >
                                <X size={16} />
                              </button>
                            ) : outcome ? (
                              <span
                                className={cx(
                                  "shrink-0 text-sm font-black",
                                  outcome.didWin
                                    ? "text-amber-100"
                                    : "text-stone-500",
                                )}
                              >
                                {outcome.didWin
                                  ? `+${formatCredits(outcome.profit)}`
                                  : "Lost"}
                              </span>
                            ) : (
                              <LockKeyhole
                                className="shrink-0 text-stone-500"
                                size={17}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </div>
      </section>

      {!nickname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
          <form
            onSubmit={handleJoin}
            className="w-full max-w-md rounded-[2rem] border border-amber-100/20 bg-[#08110e] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.8)]"
          >
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/70">
                Player check-in
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Choose a nickname
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-400">
                You will receive {formatCredits(STARTING_BALANCE)} session
                credits.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-bold text-stone-300">Nickname</span>
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                maxLength={18}
                autoFocus
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-lg font-bold text-white outline-none transition placeholder:text-stone-600 focus:border-amber-200/70"
                placeholder="Lucky player"
              />
            </label>
            <button
              type="submit"
              disabled={!nameDraft.trim()}
              className="group relative mt-5 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl border border-amber-100/55 bg-gradient-to-r from-amber-200 via-yellow-300 to-emerald-200 px-5 py-4 text-base font-black text-[#140903] shadow-[0_18px_48px_rgba(245,158,11,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(245,158,11,0.34)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:border-stone-600/40 disabled:bg-none disabled:bg-stone-800 disabled:text-stone-500 disabled:shadow-none"
            >
              <span className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/35 opacity-0 blur-sm transition duration-300 group-hover:left-full group-hover:opacity-100 group-disabled:hidden" />
              <Dices size={18} className="relative" />
              <span className="relative">Enter table</span>
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;
