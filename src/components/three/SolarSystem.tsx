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
import { getPlanetPositions, PlanetPosition, BODY_IDS } from '../../services/kiboEphemerisApi';

interface SolarSystemProps {
  onLoaded: () => void;
}

interface PlanetPositions {
  [key: string]: PlanetPosition;
}

const SolarSystem = ({ onLoaded }: SolarSystemProps) => {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const { camera } = useThree();
  const { selectedBody, previouslySelectedBody } = useStore();
  const [planetPositions, setPlanetPositions] = useState<PlanetPositions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraPositionRef = useRef(new THREE.Vector3(0, 30, 80));
  const targetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastValidTargetRef = useRef<THREE.Vector3 | null>(null);
  const lastValidCameraPositionRef = useRef<THREE.Vector3 | null>(null);

  // Function to update planet positions
  const updatePlanetPositions = async () => {
    try {
      const positions = await getPlanetPositions();
      setPlanetPositions(positions);
    } catch (error) {
      console.error('Error fetching planet positions:', error);
      setIsError(true);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchPlanetPositions = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        await updatePlanetPositions();
      } catch (error) {
        console.error('Error in SolarSystem initial load:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
        onLoaded();
      }
    };

    fetchPlanetPositions();

    // Set up interval to refresh positions every 5 minutes
    updateIntervalRef.current = setInterval(updatePlanetPositions, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [onLoaded]);

  // Update camera effect
  useEffect(() => {
    if (selectedBody && controlsRef.current) {
      const body = celestialBodies.find(body => body.id === selectedBody);
      if (body) {
        const targetPosition = planetPositions[body.id] ? 
          new THREE.Vector3(
            planetPositions[body.id].x, 
            planetPositions[body.id].y, 
            planetPositions[body.id].z
          ) : 
          new THREE.Vector3(
            body.orbitRadius, 
            0, 
            0
          );
        
        // Calculate appropriate distance based on body size
        const distanceFactor = body.id === 'sun' ? 5 : 3;
        const cameraDistance = body.radius * distanceFactor + 5;
        
        // Calculate and store new camera position
        const cameraOffset = new THREE.Vector3(cameraDistance, cameraDistance/2, cameraDistance);
        const newCameraPos = targetPosition.clone().add(cameraOffset);
        
        // Store valid positions
        lastValidTargetRef.current = targetPosition.clone();
        lastValidCameraPositionRef.current = newCameraPos.clone();
        
        // Animate camera controls target
        gsap.to(controlsRef.current.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 2,
          ease: "power2.inOut"
        });
        
        // Animate camera position
        gsap.to(camera.position, {
          x: newCameraPos.x,
          y: newCameraPos.y,
          z: newCameraPos.z,
          duration: 2,
          ease: "power2.inOut"
        });
      }
    }
    // Don't do anything when selectedBody becomes null
  }, [selectedBody, planetPositions, camera]);

  if (isLoading) {
    return <primitive object={new THREE.Object3D()} />; // Empty placeholder
  }

  return (
    <>
      <Stars />
      
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={lastValidCameraPositionRef.current?.toArray() || [0, 30, 80]}
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
        target={lastValidTargetRef.current?.toArray() || [0, 0, 0]}
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
      <CelestialBody 
        data={celestialBodies[0]} 
        position={planetPositions['sun'] ? [planetPositions['sun'].x, planetPositions['sun'].y, planetPositions['sun'].z] : [0, 0, 0]}
      />
      
      {/* Planets and other celestial bodies */}
      {celestialBodies.slice(1).map((body) => {
        const position = planetPositions[body.id];
        const hasApiPosition = !!position;
        
        return (
          <group key={body.id}>
            {/* Only show orbit path when not using API positions or when API failed */}
            {(!hasApiPosition || isError) && <OrbitPath radius={body.orbitRadius} />}
            <CelestialBody
              data={body}
              position={position ? [position.x, position.y, position.z] : undefined}
            />
          </group>
        );
      })}
    </>
  );
};

export default SolarSystem;