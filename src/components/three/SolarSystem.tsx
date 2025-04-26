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
import { PlanetaryPositions, generateFallbackPositions, BodyPosition } from '../../../pages/api/astronomy';

interface SolarSystemProps {
  onLoaded: () => void;
}

const SolarSystem = ({ onLoaded }: SolarSystemProps) => {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera } = useThree();
  const { selectedBody, setSelectedBody } = useStore();
  const [planetPositions, setPlanetPositions] = useState<PlanetaryPositions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [usingApiPositions, setUsingApiPositions] = useState(false);
  const updateIntervalRef = useRef<number>();
  const lastValidTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const lastValidCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 30, 80));

  // Function to update positions from API or fallback
  const updatePositions = async () => {
    try {
      const response = await fetch('/api/astronomy/positions');
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      const apiPositions = await response.json();
      
      // Log the positions for debugging
      console.log('Raw planet positions:', apiPositions);
      
      // Scale down the positions to make them visible in the canvas
      const scaledPositions: PlanetaryPositions = {};
      Object.entries(apiPositions).forEach(([id, pos]) => {
        const typedPos = pos as BodyPosition;
        // Convert AU to scene units (1 AU = 100 scene units)
        const scaleFactor = 100;
        scaledPositions[id] = {
          ...typedPos,
          x: typedPos.x * scaleFactor,
          y: typedPos.y * scaleFactor,
          z: typedPos.z * scaleFactor,
          distance: typedPos.distance * scaleFactor
        };
      });
      
      setPlanetPositions(scaledPositions);
      setUsingApiPositions(true);
      console.log('Scaled planet positions:', scaledPositions);
    } catch (error) {
      console.warn('Failed to get positions from API, using fallback positions:', error);
      const fallbackPositions = generateFallbackPositions();
      // Scale down fallback positions as well
      const scaledFallback: PlanetaryPositions = {};
      Object.entries(fallbackPositions).forEach(([id, pos]) => {
        const typedPos = pos as BodyPosition;
        const scaleFactor = 100;
        scaledFallback[id] = {
          ...typedPos,
          x: typedPos.x * scaleFactor,
          y: typedPos.y * scaleFactor,
          z: typedPos.z * scaleFactor,
          distance: typedPos.distance * scaleFactor
        };
      });
      setPlanetPositions(scaledFallback);
      setUsingApiPositions(false);
    }
  };

  useEffect(() => {
    console.log('Initializing with fallback positions');
    const initialPositions = generateFallbackPositions();
    // Scale down initial positions
    const scaledInitial: PlanetaryPositions = {};
    Object.entries(initialPositions).forEach(([id, pos]) => {
      const typedPos = pos as BodyPosition;
      const scaleFactor = 100;
      scaledInitial[id] = {
        ...typedPos,
        x: typedPos.x * scaleFactor,
        y: typedPos.y * scaleFactor,
        z: typedPos.z * scaleFactor,
        distance: typedPos.distance * scaleFactor
      };
    });
    setPlanetPositions(scaledInitial);
    setIsLoading(false);
    onLoaded();

    // Start position updates
    (async () => {
      try {
        console.log('Starting position updates');
        await updatePositions();
        // Update positions every 30 minutes
        updateIntervalRef.current = window.setInterval(updatePositions, 30 * 60 * 1000);
      } catch (error) {
        console.error('Error starting position updates:', error);
        setUsingApiPositions(false);
      }
    })();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [onLoaded]);

  // Log planet positions in useFrame for debugging
  useFrame((_, delta) => {
    if (!isLoading && !selectedBody) {
      Object.entries(planetPositions).forEach(([id, pos]) => {
        if (pos.distance && pos.distance > 0) {
          // Only update positions if we're using fallback positions
          if (!usingApiPositions) {
            const speed = 0.05 / pos.distance;
            const x = pos.x * Math.cos(speed * delta) - pos.z * Math.sin(speed * delta);
            const z = pos.z * Math.cos(speed * delta) + pos.x * Math.sin(speed * delta);
            pos.x = x;
            pos.z = z;
          }
          // Log planet positions every 60 frames (about once per second)
          if (delta % 60 === 0) {
            console.log(`Planet ${id} position:`, { x: pos.x, y: pos.y, z: pos.z, distance: pos.distance });
          }
        }
      });
    }
  });

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
      lastValidTarget.current = target;
      lastValidCameraPos.current = newCamPos;
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
                radius={pos?.distance || body.orbitRadius * 100}
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
