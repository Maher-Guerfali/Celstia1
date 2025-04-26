import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import CelestialBody from './CelestialBody';
import OrbitPath from './OrbitPath';
import Stars from './Stars';
import { celestialBodies } from '../../data/celestialBodies';
import { useStore } from '../../store';
import {
  getBodyPositions,
  checkApiAvailability,
  PlanetaryPositions,
  generateFallbackPositions,
} from '../../../pages/api/astronomy';

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
  const [apiAvailable, setApiAvailable] = useState(false);
  const updateIntervalRef = useRef<number>();
  const lastValidTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const lastValidCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 30, 80));

  const getFallbackPositions = useCallback((): PlanetaryPositions => {
    const fallback: PlanetaryPositions = {};
    celestialBodies.forEach((body) => {
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * body.orbitRadius;
      const z = Math.sin(angle) * body.orbitRadius;
      const y = Math.sin(body.inclination || 0) * body.orbitRadius;
      fallback[body.id] = {
        x,
        y,
        z,
        distance: body.orbitRadius,
        datetime: new Date().toISOString(),
      };
    });
    return fallback;
  }, []);

  const updatePlanetPositions = useCallback(async () => {
    if (!apiAvailable) {
      setPlanetPositions(getFallbackPositions());
      return;
    }
    try {
      const apiData = await getBodyPositions();
      const merged = { ...getFallbackPositions(), ...apiData };
      Object.entries(merged).forEach(([id, pos]) => {
        if (id !== 'sun') {
          const body = celestialBodies.find((b) => b.id === id);
          if (body) {
            const factor = body.orbitRadius / (pos.distance || 1);
            merged[id].x *= factor;
            merged[id].y *= factor;
            merged[id].z *= factor;
          }
        }
      });
      setPlanetPositions(merged);
    } catch {
      setPlanetPositions(getFallbackPositions());
    }
  }, [apiAvailable, getFallbackPositions]);

  useEffect(() => {
    console.log('Initializing with fallback positions');
    setPlanetPositions(generateFallbackPositions());
    setIsLoading(false);
    onLoaded();
  }, [onLoaded]);

  useEffect(() => {
    (async () => {
      try {
        console.log('Checking API availability in background...');
        const ok = await checkApiAvailability();
        console.log('API available:', ok);
        setApiAvailable(ok);
        if (ok) {
          console.log('Fetching planet positions from API...');
          const apiPositions = await getBodyPositions();
          setPlanetPositions(apiPositions);
          updateIntervalRef.current = window.setInterval(async () => {
            const newPositions = await getBodyPositions();
            setPlanetPositions(newPositions);
          }, 2 * 60 * 60 * 1000);
        }
      } catch (error) {
        console.error('Error with API:', error);
        setApiAvailable(false);
      }
    })();
    return () => clearInterval(updateIntervalRef.current);
  }, []);

  useFrame((_, delta) => {
    if (!isLoading && !selectedBody) {
      Object.values(planetPositions).forEach((pos) => {
        if (pos.distance && pos.distance > 0) {
          const speed = 0.05 / pos.distance;
          const x = pos.x * Math.cos(speed * delta) - pos.z * Math.sin(speed * delta);
          const z = pos.z * Math.cos(speed * delta) + pos.x * Math.sin(speed * delta);
          pos.x = x;
          pos.z = z;
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
        position={lastValidCameraPos.current.toArray()}
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
        target={lastValidTarget.current.toArray()}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={600} decay={2} castShadow />
      {celestialBodies.map((body, i) => {
        const pos = planetPositions[body.id];
        const worldPos: [number, number, number] = pos
          ? [pos.x, pos.y, pos.z]
          : [0, 0, 0];
        return (
          <group key={body.id}>
            {i > 0 && (
              <OrbitPath
                radius={
                  Math.sqrt((pos?.x || 0) ** 2 + (pos?.z || 0) ** 2) || body.orbitRadius
                }
                color={body.id === selectedBody ? '#fff' : '#555'}
                opacity={body.id === selectedBody ? 0.6 : 0.4}
                inclination={
                  Math.atan2(pos?.y || 0, Math.hypot(pos?.x || 0, pos?.z || 0))
                }
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
