import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  inclination?: number;
  eccentricity?: number;
  segments?: number;
}

const OrbitPath = ({
  radius,
  color = '#666666',
  opacity = 0.5,
  inclination = 0,
  eccentricity = 0,
  segments = 128, // Reduced from higher values for better performance
}: OrbitPathProps) => {
  // Use useMemo to create the path geometry and material only once
  const { points, material } = useMemo(() => {
    // Calculate elliptical orbit path
    const curve = new THREE.EllipseCurve(
      0, 0,                                  // Center point
      radius, radius * (1 - eccentricity),   // X and Y radius
      0, 2 * Math.PI,                        // Start and end angle
      false,                                  // Clockwise
      0                                       // Rotation
    );
    
    // Create points with appropriate segment count based on radius
    // Use fewer points for small orbits, more for large ones
    const adjustedSegments = Math.max(64, Math.min(segments, Math.floor(radius) * 3));
    const points = curve.getPoints(adjustedSegments);
    
    // Create line material with appropriate opacity
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      toneMapped: false,
    });
    
    return { points, material };
  }, [radius, color, opacity, eccentricity, segments]);

  // Fix: Create the geometry using a buffer geometry directly 
  const geometry = useMemo(() => {
    const pointsArray = points.map(p => new THREE.Vector3(p.x, 0, p.y));
    const bufferGeometry = new THREE.BufferGeometry();
    
    // Convert points array to Float32Array for buffer geometry
    const positions = new Float32Array(pointsArray.length * 3);
    
    pointsArray.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });
    
    // Add position attribute to buffer geometry
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return bufferGeometry;
  }, [points]);

  return (
    <group rotation={[inclination, 0, 0]}>
      {/* Fixed line element - using proper <line> component with the geometry and material */}
      <primitive object={new THREE.Line(geometry, material)} />
    </group>
  );
};

export default OrbitPath;