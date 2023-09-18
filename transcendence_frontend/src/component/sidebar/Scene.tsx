"use client"
import { Canvas, useFrame } from "@react-three/fiber";
import { FontData, GradientTexture, GradientType, MeshWobbleMaterial, Text, Text3D, useFont } from '@react-three/drei';
import { useRef, useState } from "react";
import * as THREE from 'three';
import { FontLoader } from 'three-stdlib';
import { useEffect } from 'react';
import RobotoBoldTypeface from '../../../public/Roboto_Bold.typeface.json';
import styles from './Scene.module.css'
import { Font } from "next/dist/compiled/@vercel/og/satori";







const PADDLE_WIDTH = 0.4;
const PADDLE_HEIGHT = 2;
const BALL_RADIUS = 0.5;

const Paddle = ({ position, direction }: { position: [number, number, number], direction: number }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  

  useFrame(() => {
    if (meshRef.current.position.y > 0.5) {
      direction = -0.01;
    } else if (meshRef.current.position.y < -0.5) {
      direction = 0.01;
    }

    meshRef.current.position.y += direction;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[PADDLE_WIDTH, PADDLE_HEIGHT, 0.5]} />
      <MeshWobbleMaterial factor={0} speed={1} color={"#0088ff"}>
              <GradientTexture stops={[0, 0.5, 1]} colors={['#e63946', '#f1faee', '#e63946']} size={10} />
      </MeshWobbleMaterial>
    </mesh>
  );
};

const Ball = ({ setLightPosition, isHovered }: { setLightPosition: (position: THREE.Vector3) => void, isHovered: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3(-0.04, 0.04, 0));
  const target = useRef<THREE.Vector3>(new THREE.Vector3(-0.5, 0, 0)); 


  
  useFrame(() => {
    if (isHovered) {
      meshRef.current.position.lerp(target.current, 0.06);
    } else {
      const paddleLeft: THREE.Box3 = new THREE.Box3().setFromObject(meshRef.current);
      const paddleRight: THREE.Box3 = new THREE.Box3().setFromObject(meshRef.current);

      paddleLeft.min.x = -3 + PADDLE_WIDTH / 2;
      paddleLeft.max.x = -3 + PADDLE_WIDTH / 2;
      paddleLeft.min.y = -PADDLE_HEIGHT / 2;
      paddleLeft.max.y = PADDLE_HEIGHT / 2;

      paddleRight.min.x = 3 - PADDLE_WIDTH / 2;
      paddleRight.max.x = 3 - PADDLE_WIDTH / 2;
      paddleRight.min.y = -PADDLE_HEIGHT / 2;
      paddleRight.max.y = PADDLE_HEIGHT / 2;

      const ballBox: THREE.Box3 = new THREE.Box3().setFromObject(meshRef.current);
    
      
      if (ballBox.intersectsBox(paddleLeft) || ballBox.intersectsBox(paddleRight)) {
        velocity.current.x = -velocity.current.x;
      }
    
      
      velocity.current.y = 0;

      meshRef.current.position.add(velocity.current);
    }

    setLightPosition(meshRef.current.position);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
      <MeshWobbleMaterial factor={0.2} speed={1} color={"#0088ff"}>
              <GradientTexture  innerCircleRadius={8} outerCircleRadius={'auto'} stops={[0, 0.9, 0]} colors={['#e63946', '#f1faee', '#a8dadc']} size={10} />
      </MeshWobbleMaterial>
    </mesh>
  );
};


const Scene = () => {
  const lightRef = useRef<THREE.PointLight>(null!);
  const [isHovered, setHovered] = useState(false);

  const setLightPosition = (position: THREE.Vector3) => {
    lightRef.current.position.set(position.x, position.y, position.z + 10);
  };

  const [fontData, setFontData] = useState<FontData | string | undefined>(undefined);

  // Charger les données de police lors du montage du composant
  useEffect(() => {
    fetch('/Roboto_Bold.typeface.json')
      .then(response => response.json())
      .then(data => setFontData(data))
      .catch(error => console.log(error));
  }, []);

  return (
    <div className={styles.container}>
    <Canvas onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <ambientLight intensity={0.5} />
      <pointLight ref={lightRef} position={[10, 10, 10]} />
      <Paddle position={[-3, 0, 0]} direction={0.01} />
      <Paddle position={[3, 0, 0]} direction={-0.01} />
      <Ball setLightPosition={setLightPosition} isHovered={isHovered}/>
    </Canvas>
    </div>
  );
};
export default Scene;
