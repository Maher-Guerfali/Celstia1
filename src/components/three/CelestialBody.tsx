import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import { useStore } from '../../store';
import { CelestialBodyData } from '../../types';

interface CelestialBodyProps {
  data: CelestialBodyData;
  isSelectable?: boolean;
  position?: [number, number, number];
}

const CelestialBody = ({ data, isSelectable = true, position }: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedBody, setSelectedBody } = useStore();
  const updatePlanetPosition = useStore(state => state.updatePlanetPosition);
  
  // Load texture only if URL is provided
  const texture = data.texture ? useTexture(data.texture) : null;
  
  // State to track if we're using API position or orbit calculation
  const [usingApiPosition, setUsingApiPosition] = useState(!!position);
  
  // Update when position prop changes
  useEffect(() => {
    setUsingApiPosition(!!position);
  }, [position]);
  
  // Handle hover effects
  useFrame(() => {
    if (meshRef.current && isSelectable) {
      if (hovered) {
        gsap.to(meshRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
      } else {
        gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      }
    }
  });
  
  // Enhanced rotation animation and position tracking
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Use API position if available, otherwise use orbital calculation
      if (position && usingApiPosition) {
        // Apply position from API
        if (groupRef.current) {
          groupRef.current.position.set(position[0], position[1], position[2]);
        }
      } else if (groupRef.current && data.orbitRadius > 0) {
        // Orbital rotation when API position isn't available
        groupRef.current.rotation.y += delta * data.orbitSpeed;
        const x = Math.cos(groupRef.current.rotation.y) * data.orbitRadius;
        const z = Math.sin(groupRef.current.rotation.y) * data.orbitRadius;
        groupRef.current.position.x = x;
        groupRef.current.position.z = z;
      }
      
      // Self rotation with smooth interpolation (always applies)
      meshRef.current.rotation.y += delta * data.rotationSpeed;
      
      // Track world position
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);
      updatePlanetPosition(data.id, worldPosition);
      
      // Add slight wobble for gas giants
      if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
      }
    }
  });

  // Material based on celestial body type
  const getMaterial = () => {
    const isSun = data.id === 'sun';
    
    return (
      <meshStandardMaterial
        map={texture}
        color={texture ? 'white' : (data.color || '#aaaaaa')}
        emissive={isSun ? (data.color || '#ffaa44') : (data.color || '#444444')}
        emissiveMap={texture}
        emissiveIntensity={isSun ? 0.8 : 0.2}
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1.5}
      />
    );
  };
  
  // Enhanced moon material with proper rotation
  const renderMoons = () => {
    if (!data.moons) return null;
    
    return data.moons.map((moon) => {
      const moonTexture = moon.texture ? useTexture(moon.texture) : null;
      const moonRef = useRef<THREE.Group>(null);
      const moonMeshRef = useRef<THREE.Mesh>(null);
      const [moonHovered, setMoonHovered] = useState(false);
      
      // Handle moon rotation
      useFrame((_, delta) => {
        if (moonRef.current) {
          // Orbit rotation
          moonRef.current.rotation.y += delta * moon.orbitSpeed;
        }
        if (moonMeshRef.current) {
          // Self rotation
          moonMeshRef.current.rotation.y += delta * moon.rotationSpeed;
          
          // Handle hover effect
          if (moonHovered) {
            gsap.to(moonMeshRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3 });
          } else {
            gsap.to(moonMeshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
          }
        }
      });
      
      return (
        <group key={moon.id} ref={moonRef}>
          <mesh
            ref={moonMeshRef}
            position={[moon.orbitRadius, 0, 0]}
            onClick={(e) => {
              e.stopPropagation(); // Prevent event from bubbling to parent
              setSelectedBody(moon.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setMoonHovered(true);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setMoonHovered(false);
            }}
          >
            <sphereGeometry args={[moon.radius, 32, 32]} />
            <meshStandardMaterial
              map={moonTexture}
              color={moon.id === 'maher_station' ? '#3385ff' : '#aaaaaa'}
              emissive={moon.id === 'maher_station' ? '#0044ff' : '#222222'}
              emissiveIntensity={moonHovered ? 0.4 : 0.2}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        </group>
      );
    });
  };

  // Enhanced rings material
  const renderRings = () => {
    if (!data.hasRings) return null;
    
    return (
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 64]} />
        <meshStandardMaterial
          color="#A7A9AC"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          emissive="#666666"
          emissiveIntensity={0.1}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
    );
  };
  
  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={() => isSelectable && setSelectedBody(data.id)}
        onPointerOver={() => isSelectable && setHovered(true)}
        onPointerOut={() => isSelectable && setHovered(false)}
        receiveShadow={data.id !== 'sun'}
        castShadow={data.id !== 'sun'}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        {getMaterial()}
      </mesh>
      {renderMoons()}
      {renderRings()}
    </group>
  );
};

export default CelestialBody;