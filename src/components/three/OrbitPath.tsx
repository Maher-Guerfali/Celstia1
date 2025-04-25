import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useStore } from '../../store';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  inclination?: number; // Added inclination prop
}

const OrbitPath = ({ radius, color = '#555555', opacity = 0.4, inclination = 0 }: OrbitPathProps) => {
  const ref = useRef<any>(null);
  const { showOrbitPaths } = useStore();
  
  // Create points for a circle with inclination
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    
    // Apply inclination rotation
    const y = Math.sin(inclination) * z;
    const adjustedZ = Math.cos(inclination) * z;
    
    points.push(new THREE.Vector3(x, y, adjustedZ));
  }
  
  // Subtle pulse animation
  useFrame(({ clock }) => {
    if (ref.current) {
      const material = ref.current.material as THREE.LineBasicMaterial;
      if (material && typeof material.opacity !== 'undefined') {
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