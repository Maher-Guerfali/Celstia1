export const BODY_IDS = {
  SUN: 'sun',
  MERCURY: 'mercury',
  VENUS: 'venus',
  EARTH: 'earth',
  MARS: 'mars',
  JUPITER: 'jupiter',
  SATURN: 'saturn',
  URANUS: 'uranus',
  NEPTUNE: 'neptune'
} as const;

export interface PlanetPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  constellation: string;
  rightAscension: number;
  declination: number;
  magnitude: number;
  datetime: string;
}

export async function getPlanetPositions(): Promise<Record<string, PlanetPosition>> {
  try {
    const response = await fetch(
      '/api/visible-planets?latitude=0&longitude=0&showCoords=true'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const positions: Record<string, PlanetPosition> = {};

    data.data.forEach((planet: any) => {
      // Convert right ascension and declination to cartesian coordinates
      const ra = planet.rightAscension * (Math.PI / 180); // Convert to radians
      const dec = planet.declination * (Math.PI / 180); // Convert to radians
      const distance = planet.distance || 20; // Use default distance if not provided

      // Convert spherical to cartesian coordinates
      const x = distance * Math.cos(dec) * Math.cos(ra);
      const y = distance * Math.cos(dec) * Math.sin(ra);
      const z = distance * Math.sin(dec);

      positions[planet.name.toLowerCase()] = {
        id: planet.name.toLowerCase(),
        name: planet.name,
        x: x,
        y: y,
        z: z,
        constellation: planet.constellation,
        rightAscension: planet.rightAscension,
        declination: planet.declination,
        magnitude: planet.magnitude,
        datetime: new Date().toISOString()
      };
    });

    return positions;
  } catch (error) {
    console.error('Error fetching planet positions:', error);
    return useDefaultPositions();
  }
}

function useDefaultPositions(): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};
  const date = new Date().toISOString();

  Object.values(BODY_IDS).forEach((bodyId, index) => {
    const orbitRadius = index === 0 ? 0 : (index * 10);
    positions[bodyId] = {
      id: bodyId,
      name: bodyId.charAt(0).toUpperCase() + bodyId.slice(1),
      x: orbitRadius,
      y: 0,
      z: 0,
      constellation: 'Unknown',
      rightAscension: 0,
      declination: 0,
      magnitude: 0,
      datetime: date
    };
  });

  return positions;
}