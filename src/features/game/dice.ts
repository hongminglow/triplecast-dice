import { DIE_VALUES } from "@/features/game/constants";
import type { DiceResult, DieValue } from "@/features/game/types";

export function randomDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue;
}

export function randomDice(): DiceResult {
  return [randomDie(), randomDie(), randomDie()];
}

export function totalDice(result: DiceResult): number {
  return result[0] + result[1] + result[2];
}

export function getDieCounts(result: DiceResult): number[] {
  return DIE_VALUES.map(
    (value) => result.filter((die) => die === value).length,
  );
}

export function hasTriple(result: DiceResult): boolean {
  return result[0] === result[1] && result[1] === result[2];
}

export function countTarget(result: DiceResult, target: number): number {
  return result.filter((die) => die === target).length;
}

export const FACE_ROTATIONS: Record<DieValue, [number, number, number]> = {
  1: [0, 0, 0],
  2: [Math.PI / 2, 0, 0],
  3: [0, -Math.PI / 2, 0],
  4: [0, Math.PI / 2, 0],
  5: [-Math.PI / 2, 0, 0],
  6: [0, Math.PI, 0],
};

export function pipPositions(value: DieValue): Array<[number, number]> {
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

export type PipFace = {
  value: DieValue;
  rotation: [number, number, number];
  position: (x: number, y: number) => [number, number, number];
};

export const PIP_FACES: PipFace[] = [
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
