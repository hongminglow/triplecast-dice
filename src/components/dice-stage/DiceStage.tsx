import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Sparkles } from "@react-three/drei";

import { CasinoCover } from "@/components/dice-stage/CasinoCover";
import { CountdownOverlay } from "@/components/dice-stage/CountdownOverlay";
import { DiceModel } from "@/components/dice-stage/DiceModel";
import { ResultOverlay } from "@/components/dice-stage/ResultOverlay";
import { randomDice, totalDice } from "@/features/game/dice";
import type { DiceResult, GamePhase } from "@/features/game/types";

type DiceStageProps = {
  phase: GamePhase;
  result: DiceResult;
  secondsLeft: number;
  winning: boolean;
};

export function DiceStage({
  phase,
  result,
  secondsLeft,
  winning,
}: DiceStageProps) {
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
        <CountdownOverlay secondsLeft={secondsLeft} urgent={urgentCountdown} />
      )}
      {showResultOverlay && (
        <ResultOverlay result={result} total={resultTotal} winning={winning} />
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
