export interface CelestialBodyData {
  id: string;
  name: string;
  radius: number;
  mass: string;
  color?: string;
  texture?: string;
  orbitRadius: number;
  orbitSpeed: number;
  
  rotationSpeed: number;
  moons?: MoonData[];
  hasRings?: boolean;
  inclination?: number; // Added property for orbital inclination
  materials?: string[];
  age?: string;

  description?: string;
}

export interface MoonData {
  id: string;
  name: string;
  mass: string;
  age: string;
  radius: number;
  description: string;
  materials: string[];
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  texture?: string;
  
}