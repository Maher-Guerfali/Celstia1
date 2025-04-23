import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { gsap } from 'gsap';
import CelestialBody from './CelestialBody';
import OrbitPath from './OrbitPath';
import Stars from './Stars';
import { celestialBodies } from '../../data/celestialBodies';
import { useStore } from '../../store';

interface SolarSystemProps {
  onLoaded: () => void;
}

const SolarSystem = ({ onLoaded }: SolarSystemProps) => {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const { camera } = useThree();
  //const { selectedBody, autoTourActive } = useStore();
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [tourTimeout, setTourTimeout] = useState<number | null>(null);
  const orbitRef = useRef<number>(0);

  // Call onLoaded when the solar system is ready
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);
  
  // Remove the camera focusing effect since we don't want zoom anymore
  
  return (
    <>
      <Stars />
      
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 30, 80]}
        fov={45}
      />
      
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        minDistance={10}
        maxDistance={200}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.1} />
      
      {/* Sun light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={1}
        distance={200}
        decay={2}
        castShadow
      />
      
      {/* Sun */}
      <CelestialBody data={celestialBodies[0]} isSelectable={false} />
      
      {/* Planets and other celestial bodies */}
      {celestialBodies.slice(1).map((body) => (
        <group key={body.id}>
          <OrbitPath radius={body.orbitRadius} />
          <CelestialBody data={body} />
        </group>
      ))}
    </>
  );
};

export default SolarSystem;