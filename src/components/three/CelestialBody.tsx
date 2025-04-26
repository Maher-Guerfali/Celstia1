import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
import { useStore } from '../../store';
import { CelestialBodyData } from '../../types';
import {  ThreeEvent } from '@react-three/fiber';
type MoonType = Exclude<CelestialBodyData['moons'], undefined>[0];

interface CelestialBodyProps {
  data: CelestialBodyData;
  isSelectable?: boolean;
  position?: [number, number, number];
  usingRealTime?: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

// Optimization: Extract Moon component to prevent unnecessary re-renders
const Moon = ({ moon, parentPosition }: { moon: MoonType; parentPosition: [number, number, number] }) => {
  // Always call useTexture to satisfy Rules of Hooks
  const moonTexture = useTexture(moon.texture || '');
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const [moonHovered, setMoonHovered] = useState(false);
  const setSelectedBody = useStore(state => state.setSelectedBody);
  
  // Calculate moon orbit based on current time
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2);
  
  // Optimization: Reduce calculation frequency for better performance
  useFrame((_, delta) => {
    // Update moon orbit angle
    setAngle(prevAngle => prevAngle + delta * moon.orbitSpeed);
    
    if (moonMeshRef.current) {
      // Update rotation
      moonMeshRef.current.rotation.y += delta * moon.rotationSpeed;
      
      // Apply hover effect without triggering state updates
      if (moonHovered !== (moonMeshRef.current.scale.x > 1.05)) {
        gsap.to(moonMeshRef.current.scale, { 
          x: moonHovered ? 1.1 : 1, 
          y: moonHovered ? 1.1 : 1, 
          z: moonHovered ? 1.1 : 1, 
          duration: 0.3,
          overwrite: true // Optimization: Prevent animation queue buildup
        });
      }
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
        <sphereGeometry args={[moon.radius, 24, 24]} /> {/* Reduced segments for better performance */}
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
  
  // Optimization: Use useMemo for derived values that don't change
  const { isSun, isGasGiant, highlightColor } = useMemo(() => ({
    isSun: data.id === 'sun',
    isGasGiant: ['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id),
    highlightColor: data.id === 'sun' ? '#ffaa22' : 
                    data.id === 'earth' ? '#66aaff' : 
                    data.id === 'mars' ? '#ff6644' : 
                    data.id === 'black_hole' ? '#ff22aa' : '#ffffff'
  }), [data.id]);

  // Handle highlighting effect - optimization: use refs to avoid state updates
  useEffect(() => {
    if (highlightRef.current) {
      gsap.to(highlightRef.current.scale, {
        x: isHighlighted ? 1.2 : 0,
        y: isHighlighted ? 1.2 : 0,
        z: isHighlighted ? 1.2 : 0,
        duration: 0.5,
        ease: 'power2.inOut',
        overwrite: true // Prevent animation queue buildup
      });
      
      // Adjust opacity separately if the material exists
      if (highlightRef.current.material instanceof THREE.Material) {
        gsap.to(highlightRef.current.material, {
          opacity: isHighlighted ? 0.5 : 0,
          duration: 0.5,
          ease: 'power2.inOut',
          overwrite: true // Prevent animation queue buildup
        });
      }
    }
  }, [isHighlighted]);

  // Optimization: Reduce hover effect handling to improve performance
  useFrame(() => {
    if (meshRef.current && isSelectable) {
      const targetScale = hovered ? 1.1 : 1;
      const currentScale = meshRef.current.scale.x;
      
      // Only apply animation if there's a significant difference
      if (Math.abs(currentScale - targetScale) > 0.01) {
        gsap.to(meshRef.current.scale, {
          x: targetScale,
          y: targetScale,
          z: targetScale,
          duration: 0.3,
          overwrite: true // Prevent animation queue buildup
        });
      }
    }
  });

  // Main animation and position update - optimized to run less frequently
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Use the real-time position from parent component if available
      if (position && usingRealTime && groupRef.current) {
        groupRef.current.position.set(...position);
      }
      
      // Apply rotation to the planet itself
      meshRef.current.rotation.y += delta * data.rotationSpeed;

      // Optimization: Update position less frequently (every other frame)
      if (Math.random() > 0.5) {
        const worldPosition = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPosition);
        updatePlanetPosition(data.id, worldPosition);
      }

      // Add subtle axial tilt to gas giants
      if (isGasGiant) {
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
      }
      
      // Animate highlight pulse when selected - optimized to use less calculations
      if (highlightRef.current && isHighlighted) {
        const pulseScale = 1.2 + Math.sin(Date.now() * 0.002) * 0.05;
        highlightRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      }
    }
  });

  // Optimization: Use useMemo for materials to prevent recreation on each render
  const material = useMemo(() => {
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
  }, [texture, data.color, isSun, isHighlighted]);

  // Optimization: Use useMemo for rings to prevent recreation on each render
  const rings = useMemo(() => {
    if (!data.hasRings) return null;

    return (
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[data.radius * 1.4, data.radius * 2.2, 48]} /> {/* Reduced segments */}
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
  }, [data.hasRings, data.radius, isHighlighted]);

  // Handle the click on this celestial body
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); // Prevent click from propagating to background
    if (isSelectable && onClick) {
      onClick();
    }
  };

  // Optimization: Reduce geometry complexity for better performance
  const sphereSegments = data.id === 'sun' || data.radius > 10 ? 48 : 32;

  return (
    <group ref={groupRef}>
      {/* Highlight glow effect */}
      <mesh
        ref={highlightRef}
        scale={isHighlighted ? 1.2 : 0}
        visible={isSelectable}
      >
        <sphereGeometry args={[data.radius * 1.2, 24, 24]} /> {/* Reduced segments */}
        <meshBasicMaterial
          color={highlightColor}
          transparent
          opacity={isHighlighted ? 0.5 : 0}
          side={THREE.FrontSide}
        />
      </mesh>
      
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => isSelectable && setHovered(true)}
        onPointerOut={() => isSelectable && setHovered(false)}
        receiveShadow={data.id !== 'sun'}
        castShadow={data.id !== 'sun'}
      >
        <sphereGeometry args={[data.radius, sphereSegments, sphereSegments]} />
        {material}
      </mesh>
      
      {data.moons?.map((moon) => (
        <Moon 
          key={moon.id} 
          moon={moon} 
          parentPosition={position || [0, 0, 0]} 
        />
      ))}
      
      {rings}
    </group>
  );
};

export default CelestialBody;