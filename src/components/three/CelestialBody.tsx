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
  onClick?: () => void;
}

const Moon = ({ moon }: { moon: MoonType }) => {
  // Always call useTexture to satisfy Rules of Hooks
  const moonTexture = useTexture(moon.texture || '');
  const moonRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const [moonHovered, setMoonHovered] = useState(false);
  const setSelectedBody = useStore(state => state.setSelectedBody);

  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * moon.orbitSpeed;
    }
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += delta * moon.rotationSpeed;
      const scale = moonHovered ? 1.1 : 1;
      gsap.to(moonMeshRef.current.scale, { x: scale, y: scale, z: scale, duration: 0.3 });
    }
  });

  return (
    <group ref={moonRef}>
      <mesh
        ref={moonMeshRef}
        position={[moon.orbitRadius, 0, 0]}
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

const CelestialBody = ({ data, isSelectable = true, position, onClick }: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const updatePlanetPosition = useStore(state => state.updatePlanetPosition);

  // Always call useTexture to satisfy Rules of Hooks
  const texture = useTexture(data.texture || '');
  const [usingApiPosition, setUsingApiPosition] = useState(!!position);

  useEffect(() => {
    setUsingApiPosition(!!position);
  }, [position]);

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
      if (position && usingApiPosition) {
        groupRef.current?.position.set(...position);
      } else if (groupRef.current && data.orbitRadius > 0) {
        groupRef.current.rotation.y += delta * data.orbitSpeed;
        const x = Math.cos(groupRef.current.rotation.y) * data.orbitRadius;
        const z = Math.sin(groupRef.current.rotation.y) * data.orbitRadius;
        groupRef.current.position.set(x, groupRef.current.position.y, z);
      }

      meshRef.current.rotation.y += delta * data.rotationSpeed;

      const worldPosition = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPosition);
      updatePlanetPosition(data.id, worldPosition);

      if (['jupiter', 'saturn', 'uranus', 'neptune'].includes(data.id)) {
        meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.02;
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
        emissiveIntensity={isSun ? 0.8 : 0.2}
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
        <Moon key={moon.id} moon={moon} />
      ))}
      {renderRings()}
    </group>
  );
};

export default CelestialBody;
