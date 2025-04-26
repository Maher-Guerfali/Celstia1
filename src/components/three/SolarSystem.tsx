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
  const [isZooming, setIsZooming] = useState(false);

  // Function to calculate planet positions based on time
  const calculatePlanetPositions = () => {
    const now = new Date();
    const baseTime = new Date('2000-01-01T00:00:00Z').getTime();
    const elapsedTime = (now.getTime() - baseTime) / (1000 * 60 * 60 * 24); // Days since 2000

    // Use current hour to add variation to the view based on time of day
    const hourFactor = (now.getHours() % 12) / 12; // 0-1 based on hour (resets at noon/midnight)
    
    const positions: { [key: string]: { x: number; y: number; z: number; distance: number } } = {};

    celestialBodies.forEach((body) => {
      if (body.id === 'sun') {
        positions[body.id] = { x: 0, y: 0, z: 0, distance: 0 };
        return;
      }

      // Calculate angle based on orbital period and current time
      const orbitPeriod = getOrbitPeriod(body.id);
      const angle = (2 * Math.PI * elapsedTime / orbitPeriod) + (hourFactor * Math.PI / 6);
      
      // Calculate eccentricity for more realistic orbits
      const eccentricity = getEccentricity(body.id);
      
      // Calculate position with slight inclination and eccentricity
      const distance = body.orbitRadius * (1 - eccentricity * Math.cos(angle));
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Add inclination to the orbit
      const inclination = getInclination(body.id);
      const y = Math.sin(angle) * distance * Math.sin(inclination);

      positions[body.id] = {
        x,
        y,
        z,
        distance
      };
    });

    return positions;
  };

  // Helper function to get orbital period in Earth days
  const getOrbitPeriod = (bodyId: string): number => {
    const periods: { [key: string]: number } = {
      mercury: 88,    // 88 Earth days
      venus: 225,     // 225 Earth days
      earth: 365.25,  // 365.25 Earth days (1 year)
      mars: 687,      // 687 Earth days
      jupiter: 4333,  // 11.86 Earth years
      saturn: 10759,  // 29.46 Earth years
      uranus: 30687,  // 84.01 Earth years
      neptune: 60190, // 164.8 Earth years
      pluto: 90560,   // 248 Earth years
      black_hole: 500000 // Fictional value
    };
    
    return periods[bodyId] || 365.25; // Default to Earth's period if not found
  };

  // Helper function to get orbital eccentricity
  const getEccentricity = (bodyId: string): number => {
    const eccentricities: { [key: string]: number } = {
      mercury: 0.205,
      venus: 0.007,
      earth: 0.017,
      mars: 0.094,
      jupiter: 0.049,
      saturn: 0.057,
      uranus: 0.046,
      neptune: 0.010,
      pluto: 0.248,
      black_hole: 0.7 // Fictional value
    };
    
    return eccentricities[bodyId] || 0.01; // Default to low eccentricity if not found
  };

  // Helper function to get orbital inclination in radians
  const getInclination = (bodyId: string): number => {
    const inclinations: { [key: string]: number } = {
      mercury: 7.0 * Math.PI / 180,
      venus: 3.4 * Math.PI / 180,
      earth: 0.0 * Math.PI / 180,
      mars: 1.9 * Math.PI / 180,
      jupiter: 1.3 * Math.PI / 180,
      saturn: 2.5 * Math.PI / 180,
      uranus: 0.8 * Math.PI / 180,
      neptune: 1.8 * Math.PI / 180,
      pluto: 17.2 * Math.PI / 180,
      black_hole: 45 * Math.PI / 180 // Fictional value
    };
    
    return inclinations[bodyId] || 0; // Default to no inclination if not found
  };

  // Function to zoom to a planet
  const zoomToPlanet = (bodyId: string) => {
    const body = celestialBodies.find((b) => b.id === bodyId);
    const pos = planetPositions[bodyId];
    
    if (!body || !pos) return;
    
    setIsZooming(true);
    
    // Disable controls during zoom
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    
    const target = new THREE.Vector3(pos.x, pos.y, pos.z);
    
    // Calculate appropriate camera distance based on planet size
    const distanceFactor = body.id === 'sun' ? 5 : body.radius < 1 ? 10 : 3;
    const zoomDistance = body.radius * distanceFactor + 5;
    
    // Create a slightly offset viewing angle for more dynamic zoom
    const randomAngle = Math.random() * Math.PI * 2;
    const randomHeight = (Math.random() * 0.4) + 0.2; // Between 0.2 and 0.6
    
    const camOffset = new THREE.Vector3(
      Math.cos(randomAngle) * zoomDistance,
      zoomDistance * randomHeight, // Slightly above the planet
      Math.sin(randomAngle) * zoomDistance
    );
    
    const newCamPos = target.clone().add(camOffset);
    
    // Animate camera position and target
    gsap.to(camera.position, {
      x: newCamPos.x,
      y: newCamPos.y,
      z: newCamPos.z,
      duration: 2.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Re-enable controls after zoom completes
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
        setIsZooming(false);
      }
    });
    
    gsap.to(controlsRef.current!.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: 2.2,
      ease: "power2.inOut"
    });
  };
  
  // Handle planet selection
  useEffect(() => {
    if (!selectedBody) return;
    zoomToPlanet(selectedBody);
  }, [selectedBody]);

  useEffect(() => {
    console.log('Initializing planet positions');
    setPlanetPositions(calculatePlanetPositions());
    setIsLoading(false);
    onLoaded();

    // Update positions more frequently (every 100ms) for smoother animation
    const interval = setInterval(() => {
      setPlanetPositions(calculatePlanetPositions());
    }, 100);

    return () => clearInterval(interval);
  }, [onLoaded]);

  // Allow manual camera control if not zooming
  useFrame(() => {
    if (isZooming && controlsRef.current) {
      controlsRef.current.update();
    }
  });

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
        minDistance={5} // Reduced to allow closer zoom
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
                inclination={getInclination(body.id)}
                eccentricity={getEccentricity(body.id)}
              />
            )}
            <CelestialBody
              data={body}
              position={worldPos}
              usingRealTime={true}
              onClick={() => setSelectedBody(body.id)}
              isHighlighted={body.id === selectedBody}
            />
          </group>
        );
      })}
    </>
  );
};

export default SolarSystem;