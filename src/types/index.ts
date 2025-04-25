export interface CelestialBodyData {
  id: string;
  name: string;
  mass: string;
  age: string;
  materials: string[];
  description: string;
  texture: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings?: boolean;
  isEasterEgg?: boolean;
  color?: string;
  moons?: Moon[];
}

export interface Moon {
  id: string;
  name: string;
  texture: string;
  radius: number;
  description: string,
  mass: string,
  age: string,
  materials: string[],
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
}

// Update PlanetInfoProps to match the simplified version we're using
export interface PlanetInfoProps {
  data: CelestialBodyData | null;
}