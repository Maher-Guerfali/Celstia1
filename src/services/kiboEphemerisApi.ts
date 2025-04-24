const API_URL = 'http://ephemeris.kibo.cz/api/v1/planets';

export const BODY_IDS = {
  SUN: 'Sun',
  MERCURY: 'Mercury',
  VENUS: 'Venus',
  EARTH: 'Earth',
  MARS: 'Mars',
  JUPITER: 'Jupiter',
  SATURN: 'Saturn',
  URANUS: 'Uranus',
  NEPTUNE: 'Neptune',
  PLUTO: 'Pluto'
} as const;

export interface PlanetPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  datetime: string;
}

export async function getPlanetPositions(): Promise<Record<string, PlanetPosition>> {
  const currentDate = new Date();
  // Format date as YYYYMMDDhhmmss
  const formattedDate = currentDate.getFullYear() +
    String(currentDate.getMonth() + 1).padStart(2, '0') +
    String(currentDate.getDate()).padStart(2, '0') +
    String(currentDate.getHours()).padStart(2, '0') +
    String(currentDate.getMinutes()).padStart(2, '0') +
    String(currentDate.getSeconds()).padStart(2, '0');

  try {
    console.log('Fetching planet positions for date:', formattedDate);
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        event: formattedDate,
        planets: Object.values(BODY_IDS),
        topo: [0, 0, 0], // longitude, latitude, altitude
        zodiac: "tropical" // default to tropical zodiac
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !data.planets) {
      throw new Error('Invalid response format from API');
    }

    console.log('Received planet data:', data);
    const positions: Record<string, PlanetPosition> = {};

    // Scale factors to make visualization more appealing
    const scaleDistances = {
      Sun: 0,
      Mercury: 10,
      Venus: 15,
      Earth: 20,
      Mars: 25,
      Jupiter: 40,
      Saturn: 55,
      Uranus: 70,
      Neptune: 85,
      Pluto: 95
    };

    // Convert spherical coordinates to cartesian
    Object.entries(data.planets).forEach(([name, coords]: [string, any]) => {
      if (!Array.isArray(coords) || coords.length < 2) {
        console.warn(`Invalid coordinates for ${name}:`, coords);
        return;
      }

      const [longitude, latitude] = coords;
      const distance = scaleDistances[name as keyof typeof scaleDistances] || 
                     (name === 'Sun' ? 0 : 20 * (Object.keys(BODY_IDS).indexOf(name.toUpperCase()) + 1));
      
      // Convert spherical to cartesian coordinates
      const phi = longitude * (Math.PI / 180);
      const theta = latitude * (Math.PI / 180);
      
      positions[name.toLowerCase()] = {
        id: name.toLowerCase(),
        name,
        x: distance * Math.cos(theta) * Math.cos(phi),
        y: distance * Math.sin(theta),
        z: distance * Math.cos(theta) * Math.sin(phi),
        datetime: currentDate.toISOString()
      };
    });

    return positions;
  } catch (error: any) {
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return useDefaultPositions();
  }
}

function useDefaultPositions(): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};
  const date = new Date().toISOString();

  // Default positions spaced in a spiral pattern
  Object.values(BODY_IDS).forEach((name, index) => {
    const angle = index * 0.5; // Spread planets around
    const orbitRadius = index === 0 ? 0 : (index * 10);
    
    positions[name.toLowerCase()] = {
      id: name.toLowerCase(),
      name,
      x: Math.cos(angle) * orbitRadius,
      y: 0,
      z: Math.sin(angle) * orbitRadius,
      datetime: date
    };
  });

  return positions;
}