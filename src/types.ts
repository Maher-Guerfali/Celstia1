export interface CelestialBodyData {
  id: string;
  name: string;
  mass: string;
  age: string;
  materials: string[];
  description: string;
  texture?: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  color?: string;
  hasRings?: boolean;
  isEasterEgg?: boolean;
  moons?: CelestialBodyData[];
  nasaId?: string; // Add NASA Horizons body ID
}

// For type safety, extend CelestialBodyData
export interface Moon extends CelestialBodyData {
  parentPlanet?: string;
}