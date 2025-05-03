/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
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
  isARMode?: boolean;
}

const SolarSystem = ({ onLoaded, isARMode = false }: SolarSystemProps) => {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera, gl } = useThree();

  const selectedBody = useStore((s) => s.selectedBody);
  const setSelectedBody = useStore((s) => s.setSelectedBody);
  const clearSelectedBody = useStore((s) => s.clearSelectedBody);

  const [planetPositions, setPlanetPositions] = useState<
    Record<string, { x: number; y: number; z: number; distance: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Use useMemo for constants that don't change
  const { periods, eccentricities, inclinations } = useMemo(() => ({
    periods: {
      mercury: 88,
      venus: 225,
      earth: 365.25,
      mars: 687,
      jupiter: 4333,
      saturn: 10759,
      uranus: 30687,
      neptune: 60190,
      pluto: 90560,
      black_hole: 500000,
    },
    eccentricities: {
      mercury: 0.205,
      venus: 0.007,
      earth: 0.017,
      mars: 0.094,
      jupiter: 0.049,
      saturn: 0.057,
      uranus: 0.046,
      neptune: 0.01,
      pluto: 0.248,
      black_hole: 0.7,
    },
    inclinations: {
      mercury: (7.0 * Math.PI) / 180,
      venus: (3.4 * Math.PI) / 180,
      earth: 0,
      mars: (1.9 * Math.PI) / 180,
      jupiter: (1.3 * Math.PI) / 180,
      saturn: (2.5 * Math.PI) / 180,
      uranus: (0.8 * Math.PI) / 180,
      neptune: (1.8 * Math.PI) / 180,
      pluto: (17.2 * Math.PI) / 180,
      black_hole: (45 * Math.PI) / 180,
    }
  }), []);

  // Store previous time to use delta for smooth animations
  const prevTimeRef = useRef<number>(Date.now());

  const calculatePlanetPositions = useCallback(() => {
    const now = new Date();
    const daysSince2000 =
      (now.getTime() - new Date('2000-01-01T00:00:00Z').getTime()) /
      (1000 * 60 * 60 * 24);
    const hourFactor = (now.getHours() % 12) / 12;
    const positions: Record<
      string,
      { x: number; y: number; z: number; distance: number }
    > = {};
  
    celestialBodies.forEach((body) => {
      if (body.id === 'sun') {
        positions[body.id] = { x: 0, y: 0, z: 0, distance: 0 };
        return;
      }
      
      // Fix: Safely access period values with fallbacks
      const period = periods[body.id as keyof typeof periods] ?? periods.earth;
      const ecc = eccentricities[body.id as keyof typeof eccentricities] ?? 0.01;
      const inc = inclinations[body.id as keyof typeof inclinations] ?? 0;
      
      const angle = (2 * Math.PI * daysSince2000) / period + hourFactor * (Math.PI / 6);
  
      const dist = body.orbitRadius * (1 - ecc * Math.cos(angle));
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = Math.sin(angle) * dist * Math.sin(inc);
  
      positions[body.id] = { x, y, z, distance: dist };
    });
  
    return positions;
  }, [periods, eccentricities, inclinations]);

  // Smooth camera focus transitions
  const focusOnPlanet = useCallback(
    (id: string | null) => {
      if (!id || !controlsRef.current) return;
      const pos = planetPositions[id];
      if (!pos) return;
      
      setIsAnimating(true);
      
      // Disable controls during animation transition
      if (controlsRef.current.enabled) {
        controlsRef.current.enabled = false;
      }
      
      // Use GSAP for smoother animations with onUpdate to keep controls synced
      gsap.to(controlsRef.current.target, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: 1.5,
        ease: "power3.inOut", // Smoother easing function
        onUpdate: () => {
          // Force update controls during animation for smoother camera movement
          if (controlsRef.current) {
            controlsRef.current.update();
          }
        },
        onComplete: () => {
          if (controlsRef.current) {
            // Re-enable controls only when animation is complete
            controlsRef.current.enabled = true;
          }
          setIsAnimating(false);
        },
      });
    },
    [planetPositions]
  );

  // Reset camera to center view
  const resetCamera = useCallback(() => {
    if (!controlsRef.current) return;
    
    // Disable controls during transition
    controlsRef.current.enabled = false;
    
    // Animate camera return to center
    gsap.to(controlsRef.current.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: "power3.inOut",
      onUpdate: () => {
        // Keep controls updated during animation
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      },
    });
  }, []);

  // Initialize and set up position calculation interval
  useEffect(() => {
    // Initial calculation
    setPlanetPositions(calculatePlanetPositions());
    setIsLoading(false);
    onLoaded();
    
    // Create a throttled interval for position updates
    // Update every 500ms instead of 100ms for better performance
    const iv = setInterval(() => {
      setPlanetPositions((current) => {
        const updated = calculatePlanetPositions();
        
        // Only update positions if there's a meaningful change
        const hasSignificantChange = Object.keys(updated).some(id => {
          if (!current[id]) return true;
          
          const dx = Math.abs(current[id].x - updated[id].x);
          const dy = Math.abs(current[id].y - updated[id].y);
          const dz = Math.abs(current[id].z - updated[id].z);
          
          // Only update if position changed by more than threshold units
          return dx > 0.01 || dy > 0.01 || dz > 0.01;
        });
        
        return hasSignificantChange ? updated : current;
      });
    }, 500);
    
    return () => clearInterval(iv);
  }, [calculatePlanetPositions, onLoaded]);

  // React to body selection changes
  useEffect(() => {
    if (selectedBody) {
      focusOnPlanet(selectedBody);
    } else {
      resetCamera();
    }
  }, [selectedBody, focusOnPlanet, resetCamera]);

  // Frame updates - improve with delta time for smoother animations
  useFrame(() => {
    // Only update controls if not in an animation transition
    if (controlsRef.current && !isAnimating) {
      controlsRef.current.update();
    }
    
    // Update time reference for next frame
    prevTimeRef.current = Date.now();
  });
  const maxOrbitRadius = useMemo(() => {
    let max = 0;
    celestialBodies.forEach(body => {
      if (body.orbitRadius > max) {
        max = body.orbitRadius;
      }
    });
    return max;
  }, []);
  // Background click handler to deselect current body
  const handleBg = (e: ThreeEvent<MouseEvent>) => {
    if (selectedBody) {
      clearSelectedBody();
      e.stopPropagation();
    }
  };
  //const cameraDistance = maxOrbitRadius * 0.8;
  const cameraNear = 0.1;
  const cameraFar = maxOrbitRadius * 4;
  if (isLoading) return <primitive object={new THREE.Object3D()} />;

  return (
    <>
      <Stars />

      <PerspectiveCamera
  ref={cameraRef}
  makeDefault
  position={[0, maxOrbitRadius * 0.3, maxOrbitRadius * 0.6]}
  fov={50}
  near={cameraNear}
  far={cameraFar}
/>

      {/* Optimized OrbitControls for smoother movement */}
      <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      panSpeed={0.6}
      zoomSpeed={0.5}
      enableZoom={true}
      enablePan={true}
      minDistance={maxOrbitRadius * 0.05}  // Allow closer zoom
      maxDistance={maxOrbitRadius * 2}     // Limit max zoom out
      target={[0, 0, 0]}
      makeDefault
    />

      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={1000} decay={2} castShadow />

      {/* Larger invisible backplane for better click detection */}
      <mesh position={[0, 0, -500]} onClick={handleBg}>
        <planeGeometry args={[10000, 10000]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Celestial bodies with optimized rendering */}
      <group>
        {celestialBodies.map((body, i) => {
          const pos = planetPositions[body.id] ?? {
            x: 0,
            y: 0,
            z: 0,
            distance: body.orbitRadius,
          };
          
          return (
            <group key={body.id}>
              {/* Only render orbit paths for planets (not sun) */}
              {i > 0 && (
                <OrbitPath
                  radius={pos.distance}
                  color="#555"
                  opacity={0.4}
                  inclination={Math.asin(pos.y / pos.distance)}
                  eccentricity={1 - pos.distance / body.orbitRadius}
                />
              )}
              <CelestialBody
                data={body}
                position={[pos.x, pos.y, pos.z]}
                usingRealTime
                isHighlighted={selectedBody === body.id}
                onClick={() => setSelectedBody(body.id)}
              />
            </group>
          );
        })}
      </group>
    </>
  );
};

export default SolarSystem;