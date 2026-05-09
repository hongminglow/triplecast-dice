import { useRef } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import type { Group } from "three";

import type { GamePhase } from "@/features/game/types";

type CasinoCoverProps = {
  phase: GamePhase;
};

export function CasinoCover({ phase }: CasinoCoverProps) {
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
