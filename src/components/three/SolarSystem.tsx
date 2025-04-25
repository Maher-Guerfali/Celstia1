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
import { 
  getBodyPositions, 
  checkApiAvailability, 
  PlanetaryPositions 
} from '../../services/astronomyApi';

interface SolarSystemProps {
  onLoaded: () => void;
}

const SolarSystem = ({ onLoaded }: SolarSystemProps) => {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const { camera } = useThree();
  const { selectedBody, setSelectedBody } = useStore();
  const [planetPositions, setPlanetPositions] = useState<PlanetaryPositions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cameraPositionRef = useRef(new THREE.Vector3(0, 30, 80));
  const targetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastValidTargetRef = useRef<THREE.Vector3 | null>(null);
  const lastValidCameraPositionRef = useRef<THREE.Vector3 | null>(null);

  // Function to get fallback planet positions based on celestialBodies data
  const getFallbackPositions = (): PlanetaryPositions => {
    const fallback: PlanetaryPositions = {};
    
    celestialBodies.forEach(body => {
      // For the sun
      if (body.id === 'sun') {
        fallback[body.id] = {
          x: 0,
          y: 0,
          z: 0,
          distance: 0,
          datetime: new Date().toISOString()
        };
      } 
      // For planets
      else {
        // Create a random angle for initial position
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * body.orbitRadius;
        const z = Math.sin(angle) * body.orbitRadius;
        
        // Add slight orbital inclination
        const inclination = body.inclination || (Math.random() * 0.1);
        const y = Math.sin(inclination) * body.orbitRadius;
        
        fallback[body.id] = {
          x,
          y,
          z,
          distance: body.orbitRadius,
          datetime: new Date().toISOString()
        };
      }
    });
    
    return fallback;
  };

  // Function to update planet positions
  const updatePlanetPositions = async () => {
    if (!apiAvailable) {
      console.log('⚠️ API not available, using fallback positions');
      setPlanetPositions(getFallbackPositions());
      return;
    }
    
    try {
      const positions = await getBodyPositions();
      
      // Add any missing bodies from fallback
      const completePositions = { ...getFallbackPositions(), ...positions };
      
      // Scale positions for better visualization if needed
      Object.keys(completePositions).forEach(key => {
        // Skip the sun
        if (key !== 'sun') {
          const body = celestialBodies.find(b => b.id === key);
          
          // Scale positions based on the celestial body data
          if (body && body.orbitRadius) {
            const scaleFactor = body.orbitRadius / (completePositions[key].distance || 1);
            completePositions[key].x *= scaleFactor;
            completePositions[key].y *= scaleFactor;
            completePositions[key].z *= scaleFactor;
          }
        }
      });
      
      setPlanetPositions(completePositions);
      setIsError(false);
    } catch (error) {
      console.error('Error fetching planet positions:', error);
      setIsError(true);
      // Use fallback positions when API fails
      setPlanetPositions(getFallbackPositions());
    }
  };

  // Check API availability once on mount
  useEffect(() => {
    const checkApi = async () => {
      const available = await checkApiAvailability();
      setApiAvailable(available);
      console.log(`API availability check: ${available ? 'ONLINE' : 'OFFLINE'}`);
      
      if (!available) {
        // Use fallback data immediately if API is unavailable
        setPlanetPositions(getFallbackPositions());
        setIsLoading(false);
        onLoaded();
      }
    };
    
    checkApi();
  }, []);

  // Initial data load
  useEffect(() => {
    const fetchPlanetPositions = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        await updatePlanetPositions();
      } catch (error) {
        console.error('Error in SolarSystem initial load:', error);
        setIsError(true);
        // Use fallback positions on error
        setPlanetPositions(getFallbackPositions());
      } finally {
        setIsLoading(false);
        onLoaded();
      }
    };

    if (apiAvailable) {
      fetchPlanetPositions();

      // Set up interval to refresh positions every 2 hours
      updateIntervalRef.current = setInterval(updatePlanetPositions, 2 * 60 * 60 * 1000);
    }

    // Clean up interval on unmount
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [onLoaded, apiAvailable]);

  // Animation loop for subtle planet movements
  useFrame((state, delta) => {
    // Gently animate planets even without API updates
    if (!isLoading && !selectedBody) {
      Object.keys(planetPositions).forEach(key => {
        if (key !== 'sun') {
          const position = planetPositions[key];
          if (position) {
            // Find the corresponding celestial body
            const body = celestialBodies.find(b => b.id === key);
            
            // Rotate slightly around the sun (slower for further planets)
            const rotationSpeed = body ? 0.05 / body.orbitRadius : 0.05;
            const oldX = position.x;
            const oldZ = position.z;
            position.x = oldX * Math.cos(rotationSpeed * delta) - oldZ * Math.sin(rotationSpeed * delta);
            position.z = oldZ * Math.cos(rotationSpeed * delta) + oldX * Math.sin(rotationSpeed * delta);
          }
        }
      });
    }
  });

  // Update camera effect when a celestial body is selected
  useEffect(() => {
    if (selectedBody && controlsRef.current && Object.keys(planetPositions).length > 0) {
      const body = celestialBodies.find(body => body.id === selectedBody);
      if (body) {
        const position = planetPositions[body.id];
        const targetPosition = position ? 
          new THREE.Vector3(position.x, position.y, position.z) : 
          new THREE.Vector3(body.orbitRadius, 0, 0);
        
        // Calculate appropriate distance based on body size
        const distanceFactor = body.id === 'sun' ? 5 : 3;
        const cameraDistance = body.radius * distanceFactor + 5;
        
        // Calculate offset based on size
        const angle = Math.random() * Math.PI * 2; // random viewing angle
        const cameraOffset = new THREE.Vector3(
          Math.cos(angle) * cameraDistance,
          cameraDistance * 0.3, // slight elevation
          Math.sin(angle) * cameraDistance
        );
        
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
  }, [selectedBody, planetPositions, camera]);

  if (isLoading) {
    return <primitive object={new THREE.Object3D()} />; // Empty placeholder while loading
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

      <ambientLight intensity={0.5} />
      <pointLight
        position={[0, 0, 0]}
        intensity={1.5}
        distance={600}
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
        
        // If we have real positions, use those, otherwise use the default orbital radius from body data
        const orbitRadius = position ? 
          Math.sqrt(position.x * position.x + position.z * position.z) : 
          body.orbitRadius;
          
        // Calculate orbital inclination
        const inclination = position ? 
          Math.atan2(position.y, Math.sqrt(position.x * position.x + position.z * position.z)) : 
          (body.inclination || 0);
          
        return (
          <group key={body.id}>
            {/* Always show orbit path */}
            <OrbitPath 
              radius={orbitRadius} 
              color={body.id === selectedBody ? '#ffffff' : '#555555'}
              opacity={body.id === selectedBody ? 0.6 : 0.4}
              inclination={inclination}
            />
            <CelestialBody
              data={body}
              position={position ? [position.x, position.y, position.z] : undefined}
              onClick={() => setSelectedBody(body.id)}
            />
          </group>
        );
      })}
      
      {isError && apiAvailable && (
        <group position={[0, 20, 0]}>
          <mesh>
            <planeGeometry args={[20, 5]} />
            <meshBasicMaterial color="red" transparent opacity={0.7} />
          </mesh>
        
        </group>
      )}
    </>
  );
};

export default SolarSystem;