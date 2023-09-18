"use client"
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Trail, Float, Line, Sphere, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import styles from './RL.module.css'

interface AtomProps {
  [key: string]: any;
}

interface ElectronProps extends AtomProps {
  radius?: number;
  speed?: number;
}

export default function ReactLogo() {
  return (
    <div className={styles.react} >
    <Canvas
      style={{borderRadius:'50%'}}
      camera={{ position: [0, 0, 10] }}
      gl={{ antialias: true, pixelRatio: (typeof window !== 'undefined' ? window.devicePixelRatio * 2 : 1) }}
      >
      <color attach="background" args={['black']} />
      <Float speed={4} rotationIntensity={3} floatIntensity={1}>
        <Atom />
      </Float>
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1}  />
      </EffectComposer>
    </Canvas>
    </div>
  );
}

function Atom(props: AtomProps) {
  const points = useMemo(() => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100), []);
  return (
    <group {...props}>
      <Line worldUnits points={points} color="#0099ff" lineWidth={0.3} />
      <Line worldUnits points={points} color="#0099ff" lineWidth={0.3} rotation={[0, 0, 1]} />
      <Line worldUnits points={points} color="#0099ff" lineWidth={0.3} rotation={[0, 0, -1]} />
      <Electron position={[0, 0, 0.5]} speed={6} />
      <Electron position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 3]} speed={6.5} />
      <Electron position={[0, 0, 0.5]} rotation={[0, 0, -Math.PI / 3]} speed={7} />
      <Sphere args={[0.55, 64, 64]}>
        <meshBasicMaterial color={[1, 10, 30]} toneMapped={false} />
      </Sphere>
    </group>
  );
}

function Electron({ radius = 2.75, speed = 6, ...props }: ElectronProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state: { clock: THREE.Clock }) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current?.position.set(Math.sin(t) * radius, (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25, 0);
  });
  return (
    <group {...props}>
      <Trail local width={5} length={6} color={new THREE.Color(2, 1, 10)} attenuation={(t) => t * t}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color={[1, 15, 30]} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
}
