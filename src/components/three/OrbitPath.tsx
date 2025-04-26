import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { useStore } from '../../store';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  inclination?: number;
}

const OrbitPath = ({
  radius,
  color = '#555555',
  opacity = 0.4,
  inclination = 0,
}: OrbitPathProps) => {
  // Drei's <Line> uses Three.js Line2 under the hood
  const ref = useRef<Line2>(null);
  const showOrbitPaths = useStore((s) => s.showOrbitPaths);

  // Precompute circle points
  const points: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = Math.sin(inclination) * z;
    const adjZ = Math.cos(inclination) * z;
    points.push(new THREE.Vector3(x, y, adjZ));
  }

  // Animate opacity
  useFrame(({ clock }) => {
    const material = ref.current?.material;
    if (material instanceof THREE.LineBasicMaterial) {
      material.opacity = opacity * (0.7 + Math.sin(clock.getElapsedTime() * 0.5) * 0.3);
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
