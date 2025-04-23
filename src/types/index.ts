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
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
}

export interface PlanetInfoProps {
  data: CelestialBodyData | null;
  onClose: () => void;
  visible: boolean;
}