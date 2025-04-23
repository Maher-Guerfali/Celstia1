import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import { useStore } from '../../store';
import { CelestialBodyData, Moon } from '../../types';

interface CelestialBodyProps {
  data: CelestialBodyData;
  isSelectable?: boolean;
}

const CelestialBody = ({ data, isSelectable = true }: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedBody, setSelectedBody } = useStore();
  const updatePlanetPosition = useStore(state => state.updatePlanetPosition);
  
  // Load texture only if URL is provided
  const texture = data.texture ? useTexture(data.texture) : null;
  
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
      // Self rotation with smooth interpolation
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
    
    if (groupRef.current && data.orbitRadius > 0) {
      // Orbital rotation
      groupRef.current.rotation.y += delta * data.orbitSpeed;
      const x = Math.cos(groupRef.current.rotation.y) * data.orbitRadius;
      const z = Math.sin(groupRef.current.rotation.y) * data.orbitRadius;
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
    }
  });

  // Material based on celestial body type
  const getMaterial = () => {
    // For the Sun, increase emissive intensity
    if (data.id === 'sun') {
      return (
        <meshPhongMaterial
          map={texture}
          emissive={data.color || '#ffcc00'}
          emissiveIntensity={2}
          emissiveMap={texture}
        />
      );
    }
    
    // For Black Hole
    if (data.id === 'black_hole') {
      return (
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.8}
        />
      );
    }
    
    // Enhanced material for planets with emission
    return (
      <meshStandardMaterial
        map={texture}
        color={texture ? 'white' : (data.color || '#aaaaaa')}
        emissive={data.color || '#444444'}
        emissiveIntensity={0.1}
        metalness={0.5}
        roughness={0.7}
      />
    );
  };
  
  // Enhanced moon material
  const renderMoons = () => {
    if (!data.moons) return null;
    
    return data.moons.map((moon: Moon) => {
      const moonTexture = moon.texture ? useTexture(moon.texture) : null;
      
      return (
        <group key={moon.id} rotation={[0, Math.random() * Math.PI * 2, 0]}>
          <mesh position={[moon.orbitRadius, 0, 0]}>
            <sphereGeometry args={[moon.radius, 32, 32]} />
            <meshStandardMaterial
              color={moon.id === 'maher_station' ? '#3385ff' : '#aaaaaa'}
              map={moonTexture}
              emissive={moon.id === 'maher_station' ? '#0044ff' : '#222222'}
              emissiveIntensity={0.2}
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
    <group ref={groupRef} position={[data.orbitRadius, 0, 0]}>
      <mesh
        ref={meshRef}
        onClick={() => isSelectable && setSelectedBody(data.id)} // This will only trigger the UI
        onPointerOver={() => isSelectable && setHovered(true)}
        onPointerOut={() => isSelectable && setHovered(false)}
        receiveShadow={data.id !== 'sun'}
        castShadow={data.id !== 'sun'}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        {getMaterial()}
      </mesh>
      
      {renderRings()}
      {renderMoons()}
    </group>
  );
};

export default CelestialBody;