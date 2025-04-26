import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
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
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera } = useThree();
  const { selectedBody, setSelectedBody } = useStore();
  const [planetPositions, setPlanetPositions] = useState<{ [key: string]: { x: number; y: number; z: number; distance: number } }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Function to calculate planet positions based on time
  const calculatePlanetPositions = () => {
    const now = new Date();
    const baseTime = new Date('2000-01-01T00:00:00Z').getTime();
    const elapsedTime = (now.getTime() - baseTime) / (1000 * 60 * 60 * 24); // Days since 2000

    const positions: { [key: string]: { x: number; y: number; z: number; distance: number } } = {};

    celestialBodies.forEach((body) => {
      if (body.id === 'sun') {
        positions[body.id] = { x: 0, y: 0, z: 0, distance: 0 };
        return;
      }

      // Calculate angle based on orbital period
      //const period = body.orbitPeriod || 365; // Default to Earth's period if not specified
      const angle = (2 * Math.PI * elapsedTime) / 1;

      // Calculate position
      const x = Math.cos(angle) * body.orbitRadius;
      const z = Math.sin(angle) * body.orbitRadius;
      const y = Math.sin(body.inclination || 0) * body.orbitRadius;

      positions[body.id] = {
        x,
        y,
        z,
        distance: body.orbitRadius
      };
    });

    return positions;
  };

  useEffect(() => {
    console.log('Initializing planet positions');
    setPlanetPositions(calculatePlanetPositions());
    setIsLoading(false);
    onLoaded();

    // Update positions every second
    const interval = setInterval(() => {
      setPlanetPositions(calculatePlanetPositions());
    }, 1000);

    return () => clearInterval(interval);
  }, [onLoaded]);

  useEffect(() => {
    if (!selectedBody) return;
    const body = celestialBodies.find((b) => b.id === selectedBody);
    const pos = planetPositions[selectedBody];
    if (body && pos) {
      const target = new THREE.Vector3(pos.x, pos.y, pos.z);
      const distFactor = body.id === 'sun' ? 5 : 3;
      const camDist = body.radius * distFactor + 5;
      const angle = Math.random() * Math.PI * 2;
      const camOffset = new THREE.Vector3(
        Math.cos(angle) * camDist,
        camDist * 0.3,
        Math.sin(angle) * camDist
      );
      const newCamPos = target.clone().add(camOffset);
      gsap.to(controlsRef.current!.target, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 2,
        ease: 'power2.inOut',
      });
      gsap.to(camera.position, {
        x: newCamPos.x,
        y: newCamPos.y,
        z: newCamPos.z,
        duration: 2,
        ease: 'power2.inOut',
      });
    }
  }, [selectedBody, planetPositions, camera.position]);

  if (isLoading) return <primitive object={new THREE.Object3D()} />;

  return (
    <>
      <Stars />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 200, 500]}
        fov={45}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        minDistance={50}
        maxDistance={1000}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={1000} decay={2} castShadow />
      {celestialBodies.map((body, i) => {
        const pos = planetPositions[body.id];
        const worldPos: [number, number, number] = pos
          ? [pos.x, pos.y, pos.z]
          : [0, 0, 0];
        return (
          <group key={body.id}>
            {i > 0 && (
              <OrbitPath
                radius={pos?.distance || body.orbitRadius}
                color={body.id === selectedBody ? '#fff' : '#555'}
                opacity={body.id === selectedBody ? 0.6 : 0.4}
                inclination={Math.atan2(pos?.y || 0, Math.hypot(pos?.x || 0, pos?.z || 0))}
              />
            )}
            <CelestialBody
              data={body}
              position={worldPos}
              onClick={() => setSelectedBody(body.id)}
            />
          </group>
        );
      })}
    </>
  );
};

export default SolarSystem;
