import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Shape({ position, color, speed, shape }: {
  position: [number, number, number];
  color: string;
  speed: number;
  shape: 'torus' | 'octa' | 'ico';
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
    mesh.current.rotation.y = state.clock.elapsedTime * speed;
    mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.5;
  });

  return (
    <mesh ref={mesh} position={position}>
      {shape === 'torus' && <torusGeometry args={[0.8, 0.2, 16, 32]} />}
      {shape === 'octa' && <octahedronGeometry args={[0.8]} />}
      {shape === 'ico' && <icosahedronGeometry args={[0.7]} />}
      <meshStandardMaterial
        color={color}
        wireframe
        transparent
        opacity={0.4}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function FloatingShapes() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#00d4ff" intensity={0.5} />
      <pointLight position={[-10, -10, -10]} color="#7c3aed" intensity={0.5} />
      <Shape position={[-6, 2, -5]} color="#00d4ff" speed={0.3} shape="torus" />
      <Shape position={[6, -1, -6]} color="#7c3aed" speed={0.4} shape="ico" />
      <Shape position={[0, 3, -8]} color="#00ff88" speed={0.2} shape="octa" />
      <Shape position={[-8, -2, -4]} color="#ff0080" speed={0.35} shape="torus" />
      <Shape position={[8, 3, -7]} color="#00d4ff" speed={0.25} shape="octa" />
    </>
  );
}
