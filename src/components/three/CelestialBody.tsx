import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import { useStore } from '../../store';
import { CelestialBodyData } from '../../types';

type MoonType = Exclude<CelestialBodyData['moons'], undefined>[0];

interface CelestialBodyProps {
  data: CelestialBodyData;
  isSelectable?: boolean;
  position?: [number, number, number];
  usingRealTime?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const Moon = ({ moon, parentPosition }: { moon: MoonType; parentPosition: [number, number, number] }) => {
  // Always call useTexture to satisfy Rules of Hooks
  const moonTexture = useTexture(moon.texture || '');
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const [moonHovered, setMoonHovered] = useState(false);
  const setSelectedBody = useStore(state => state.setSelectedBody);
  
  // Calculate moon orbit based on current time
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  
  useFrame((_, delta) => {
    // Update moon orbit angle
    setAngle(prevAngle => prevAngle + delta * moon.orbitSpeed);
    
    if (moonMeshRef.current) {
      // Update rotation
      moonMeshRef.current.rotation.y += delta * moon.rotationSpeed;
      
      // Update scale on hover using GSAP correctly
      const scale = moonHovered ? 1.1 : 1;
      gsap.to(moonMeshRef.current.scale, { x: scale, y: scale, z: scale, duration: 0.3 });
    }
  });

  // Calculate moon position based on angle
  const moonX = Math.cos(angle) * moon.orbitRadius;
  const moonZ = Math.sin(angle) * moon.orbitRadius;

  return (
    <group position={parentPosition}>
      <mesh
        ref={moonMeshRef}
        position={[moonX, 0, moonZ]}
        onClick={(e) => {
          e.stopPropagation();
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
};

const CelestialBody = ({ 
  data, 
  isSelectable = true, 
  position, 
  usingRealTime = false, 
  isHighlighted = false,
  onClick 
}: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const highlightRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const updatePlanetPosition = useStore(state => state.updatePlanetPosition);

  // Always call useTexture to satisfy Rules of Hooks
  const texture = useTexture(data.texture || '');

  // Handle highlighting effect
  useEffect(() => {
    if (highlightRef.current) {
      gsap.to(highlightRef.current.scale, {
        x: isHighlighted ? 1.2 : 0,
        y: isHighlighted ? 1.2 : 0,
        z: isHighlighted ? 1.2 : 0,
        duration: 0.5,
        ease: 'power2.inOut'
      });
      
      // Adjust opacity separately
      gsap.to(highlightRef.current.material, {
        opacity: isHighlighted ? 0.5 : 0,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    }
  }, [isHighlighted]);

  useFrame(() => {
    if (meshRef.current && isSelectable) {
      gsap.to(meshRef.current.scale, {
        x: hovered ? 1.1 : 1,
        y: hovered ? 1.1 : 1,
        z: hovered ? 1.1 : 1,
        duration: 0.3,
      });
    }
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Use the real-time position from parent component if available
      if (position && usingRealTime && groupRef.current) {
        groupRef.current.position.set(...position);
      }
      
      // Apply rotation to the planet itself
      meshRef.current.rotation.y += delta * data.rotationSpeed;

      // Update position in the store for UI and other components
      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);
      updatePlanetPosition(data.id, worldPosition);

      // Add subtle axial tilt to gas giants
      if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
      }
      
      // Animate highlight pulse when selected
      if (highlightRef.current && isHighlighted) {
        const pulseScale = 1.2 + Math.sin(Date.now() * 0.002) * 0.05;
        highlightRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      }
    }
  });

  const getMaterial = () => {
    const isSun = data.id === 'sun';

    return (
      <meshStandardMaterial
        map={texture}
        color={texture ? 'white' : data.color || '#aaaaaa'}
        emissive={isSun ? data.color || '#ffaa44' : data.color || '#444444'}
        emissiveMap={texture}
        emissiveIntensity={isSun ? 0.8 : isHighlighted ? 0.4 : 0.2}
        metalness={0.8}
        roughness={0.2}
        envMapIntensity={1.5}
      />
    );
  };

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
          emissiveIntensity={isHighlighted ? 0.3 : 0.1}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>
    );
  };

  // Determine highlight color based on body type
  const getHighlightColor = () => {
    if (data.id === 'sun') return '#ffaa22';
    if (data.id === 'earth') return '#66aaff';
    if (data.id === 'mars') return '#ff6644';
    if (data.id === 'black_hole') return '#ff22aa';
    return '#ffffff';
  };

  return (
    <group ref={groupRef}>
      {/* Highlight glow effect */}
      <mesh
        ref={highlightRef}
        scale={0}
        visible={isSelectable}
      >
        <sphereGeometry args={[data.radius * 1.2, 32, 32]} />
        <meshBasicMaterial
          color={getHighlightColor()}
          transparent
          opacity={0.5}
          side={THREE.FrontSide}
        />
      </mesh>
      
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          if (isSelectable && onClick) onClick();
        }}
        onPointerOver={() => isSelectable && setHovered(true)}
        onPointerOut={() => isSelectable && setHovered(false)}
        receiveShadow={data.id !== 'sun'}
        castShadow={data.id !== 'sun'}
      >
        <sphereGeometry args={[data.radius, 64, 64]} />
        {getMaterial()}
      </mesh>
      
      {data.moons?.map((moon) => (
        <Moon 
          key={moon.id} 
          moon={moon} 
          parentPosition={position || [0, 0, 0]} 
        />
      ))}
      
      {renderRings()}
    </group>
  );
};

export default CelestialBody;