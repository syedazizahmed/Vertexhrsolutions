import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import ParticleField from './ParticleField';
import FloatingShapes from './FloatingShapes';

export default function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 60 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ParticleField count={2500} />
          <FloatingShapes />
        </Suspense>
      </Canvas>
    </div>
  );
}
