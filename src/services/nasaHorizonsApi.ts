// src/services/nasaHorizonsApi.ts

const NASA_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/https://ssd.jpl.nasa.gov/api/horizons.api'
  : 'https://ssd.jpl.nasa.gov/api/horizons.api';

export const NASA_BODY_IDS = {
  SUN: '10',     // Sun
  MERCURY: '199', // Mercury
  VENUS: '299',   // Venus
  EARTH: '399',   // Earth
  MARS: '499',    // Mars
  JUPITER: '599', // Jupiter 
  SATURN: '699',  // Saturn
  URANUS: '799',  // Uranus
  NEPTUNE: '899', // Neptune
  PLUTO: '999',   // Pluto
} as const;

export interface PlanetPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  distance: number;
  datetime: string;
}

// Helper function to fetch a single body position
async function fetchBodyPosition(bodyId: string, bodyName: string, date: string): Promise<PlanetPosition | null> {
  try {
    console.log(`🌍 Fetching position for ${bodyName}...`);
    
    const params = new URLSearchParams({
      format: 'json',
      COMMAND: `'${bodyId}'`, // Add quotes to prevent numeric interpretation
      EPHEM_TYPE: 'VECTORS',
      CENTER: '@0',
      TLIST: date,
      REF_PLANE: 'ECLIPTIC',
      VEC_TABLE: '3',
      VEC_CORR: 'NONE',
      OUT_UNITS: 'AU-D',
      CSV_FORMAT: 'NO' // Change to NO for JSON response
    });

    const response = await fetch(`${NASA_API_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Debug response
    console.log(`📡 ${bodyName} API response:`, data);

    // Check if we have valid data
    if (!data.result) {
      console.warn(`⚠️ No data returned for ${bodyName}`);
      return null;
    }

    // Parse the vector data from the response
    const vectorMatch = data.result.match(/\$\$SOE\n([\s\S]*?)\n\$\$EOE/);
    if (!vectorMatch) {
      console.warn(`⚠️ No vector data found for ${bodyName}`);
      return null;
    }

    // Parse the vector line
    const [x, y, z] = vectorMatch[1].trim().split(',').map(Number);
    const distance = Math.sqrt(x*x + y*y + z*z);

    return {
      id: bodyName.toLowerCase(),
      name: bodyName,
      x,
      y,
      z,
      distance,
      datetime: date
    };

  } catch (error) {
    console.error(`❌ Error fetching ${bodyName} position:`, error);
    return null;
  }
}

export async function getPlanetPositions(): Promise<Record<string, PlanetPosition>> {
  const positions: Record<string, PlanetPosition> = {};
  const currentDate = new Date().toISOString().split('T')[0];

  console.group('🚀 NASA Horizons API Calls');
  
  for (const [name, id] of Object.entries(NASA_BODY_IDS)) {
    const position = await fetchBodyPosition(id, name, currentDate);
    if (position) {
      positions[position.id] = position;
    }
  }

  console.groupEnd();
  return positions;
}