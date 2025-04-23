import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useStore } from '../../store';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
}

const OrbitPath = ({ radius, color = '#555555', opacity = 0.4 }: OrbitPathProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const { showOrbitPaths } = useStore();
  
  // Create points for a circle
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(
      Math.cos(theta) * radius,
      0,
      Math.sin(theta) * radius
    ));
  }
  
  // Subtle pulse animation
  useFrame(({ clock }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.Material;
      if (material.opacity) {
        material.opacity = opacity * (0.7 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3);
      }
    }
  });
  
  if (!showOrbitPaths) return null;
  
  return (
    <Line
      ref={ref}
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
};

export default OrbitPath;