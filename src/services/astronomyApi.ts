const API_KEY = 'YOUR_API_KEY'; // You'll need to get this from astronomyapi.com
const API_URL = 'https://api.astronomyapi.com/api/v2';

export const BODY_IDS = {
  SUN: 'sun',
  MERCURY: 'mercury',
  VENUS: 'venus',
  EARTH: 'earth',
  MARS: 'mars',
  JUPITER: 'jupiter',
  SATURN: 'saturn',
  URANUS: 'uranus',
  NEPTUNE: 'neptune',
  PLUTO: 'pluto'
} as const;

export interface PlanetPosition {
  id: string;
  x: number;
  y: number;
  z: number;
  datetime: string;
}

export async function getPlanetPositions(): Promise<Record<string, PlanetPosition>> {
  const bodies = Object.values(BODY_IDS).join(',');
  const date = '2025-04-24T00:00:00Z';

  try {
    const response = await fetch(
      `${API_URL}/bodies/positions?bodies=${bodies}&latitude=0&longitude=0&from_date=${date}&to_date=${date}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const positions: Record<string, PlanetPosition> = {};

    // Process each body's position data
    Object.entries(data.data).forEach(([bodyName, bodyData]: [string, any]) => {
      positions[bodyName.toLowerCase()] = {
        id: bodyName.toLowerCase(),
        x: bodyData.cartesian.x / 1000000, // Convert to AU scale
        y: bodyData.cartesian.z / 1000000, // Swap Y and Z for Three.js
        z: bodyData.cartesian.y / 1000000,
        datetime: date
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
      x: orbitRadius,
      y: 0,
      z: 0,
      datetime: date
    };
  });

  return positions;
}