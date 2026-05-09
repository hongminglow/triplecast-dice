import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { MathUtils } from "three";
import type { Group } from "three";

import { DiePips } from "@/components/dice-stage/DiePips";
import { FACE_ROTATIONS } from "@/features/game/dice";
import type { DieValue, GamePhase } from "@/features/game/types";

type DiceModelProps = {
  value: DieValue;
  phase: GamePhase;
  position: [number, number, number];
  index: number;
};

export function DiceModel({ value, phase, position, index }: DiceModelProps) {
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const isRolling = phase === "rolling";
    const speed = 6.6;

    groupRef.current.position.y = MathUtils.damp(
      groupRef.current.position.y,
      position[1],
      8,
      delta,
    );

    if (isRolling) {
      groupRef.current.rotation.x += delta * speed * (1.2 + index * 0.15);
      groupRef.current.rotation.y += delta * speed * (1.02 + index * 0.11);
      groupRef.current.rotation.z += delta * speed * (0.9 + index * 0.08);
      return;
    }

    const target = FACE_ROTATIONS[value];
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
