import { PIP_FACES, pipPositions } from "@/features/game/dice";

export function DiePips() {
  return (
    <>
      {PIP_FACES.map((face) =>
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
