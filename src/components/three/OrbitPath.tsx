import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  segments?: number;
  inclination?: number;
  eccentricity?: number;
}

const OrbitPath = ({ 
  radius, 
  color = '#555555', 
  opacity = 0.4, 
  segments = 128,
  inclination = 0,
  eccentricity = 0
}: OrbitPathProps) => {
  // Create an elliptical path based on radius and eccentricity
  const points = useMemo(() => {
    const pointsArray = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Calculate elliptical orbit
      const distance = radius * (1 - eccentricity * Math.cos(angle));
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      // Apply inclination
      const y = Math.sin(angle) * distance * Math.sin(inclination);
      pointsArray.push(new THREE.Vector3(x, y, z));
    }
    return pointsArray;
  }, [radius, segments, inclination, eccentricity]);

  // Create a curve from the points
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points, true);
  }, [points]);

  // Get geometry points from the curve
  const curvePoints = useMemo(() => {
    return curve.getPoints(segments);
  }, [curve, segments]);

  return (
    <group>
      <line>
        <bufferGeometry>
          <float32BufferAttribute 
            attach="attributes-position" 
            array={new Float32Array(curvePoints.flatMap(p => [p.x, p.y, p.z]))} 
            count={curvePoints.length} 
            itemSize={3} 
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          linewidth={1} 
        />
      </line>
    </group>
  );
};

export default OrbitPath;