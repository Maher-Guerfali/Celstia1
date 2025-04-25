// File: src/services/astronomyApi.ts

// Utility to build proxy URL for serverless function
const buildProxyUrl = (path: string, params: Record<string, string | number | string[]> = {}) => {
  // Convert all values to strings for URLSearchParams
  const stringParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key, 
      Array.isArray(value) ? value.join(',') : String(value)
    ])
  );
  
  const query = new URLSearchParams(stringParams);
  return `/api/astronomy-proxy?${query.toString()}`;
};

export interface PlanetaryPosition {
  x: number;
  y: number;
  z: number;
  distance: number;
  datetime: string;
}

export interface PlanetaryPositions {
  [key: string]: PlanetaryPosition;
}

// Get positions for multiple bodies on a specific date
export async function getBodyPositions(): Promise<PlanetaryPositions> {
  const now = new Date();
  const date = now.toISOString().slice(0,10);
  const time = now.toISOString().slice(11,19);

  const params = {
    latitude: 40.7128,
    longitude: -74.0060,
    elevation: 0,
    bodies: ['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'],
    from_date: date,
    to_date: date,
    time,
  };

  const response = await fetch(buildProxyUrl('bodies/positions', params), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(response.statusText);

  const { data } = await response.json();
  
  const positions: PlanetaryPositions = {};
  data.table.rows.forEach((row: any) => {
    const id = row.entry.id.toLowerCase();
    const cell = row.cells?.[0];
    if (!cell?.position) return;
    const eq = cell.position.equatorial;
    const ra = (parseFloat(eq.rightAscension.hours) * 15 + parseFloat(eq.rightAscension.minutes) / 4 + parseFloat(eq.rightAscension.seconds) / 240) * Math.PI / 180;
    const dec = (parseFloat(eq.declination.degrees) + parseFloat(eq.declination.minutes) / 60 + parseFloat(eq.declination.seconds) / 3600) * Math.PI / 180;
    const dist = parseFloat(cell.distance.fromEarth.au);
    positions[id] = {
      x: dist * Math.cos(dec) * Math.cos(ra),
      y: dist * Math.sin(dec),
      z: dist * Math.cos(dec) * Math.sin(ra),
      distance: dist,
      datetime: new Date().toISOString(),
    };
  });
  
  // Ensure Earth has a position (since it's the reference point)
  if (!positions.earth) positions.earth = { x: 0, y: 0, z: 0, distance: 0, datetime: new Date().toISOString() };
  return positions;
}

// Fetch position for a specific body using GET method
export const getBodyPosition = async (
  bodyId: string,
  latitude: number,
  longitude: number,
  elevation: number = 0,
  date: string = new Date().toISOString().slice(0,10),
  time: string = new Date().toISOString().slice(11,19)
): Promise<any> => {
  const params = {
    latitude,
    longitude,
    elevation,
    from_date: date,
    to_date: date, // Same day for a single position
    time,
  };

  const url = buildProxyUrl(`bodies/positions/${bodyId}`, params);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(response.statusText);

  const data = await response.json();
  return data.data.rows[0]; // Return the first row which contains the body data
};

// New function to get position history for a body over multiple days
export const getBodyPositionHistory = async (
  bodyId: string,
  latitude: number,
  longitude: number,
  elevation: number = 0,
  from_date: string,
  to_date: string,
  time: string = '12:00:00'
): Promise<any> => {
  const params = {
    latitude,
    longitude,
    elevation,
    from_date,
    to_date,
    time,
  };

  const url = buildProxyUrl(`bodies/positions/${bodyId}`, params);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error(response.statusText);

  const data = await response.json();
  return data.data.rows; // Return all rows containing position history
}

// Add this function to check API availability
export async function checkApiAvailability(): Promise<boolean> {
  try {
    // Try to fetch the sun's position as a simple availability check
    const testParams = {
      latitude: 0,
      longitude: 0,
      elevation: 0,
      bodies: ['sun'],
      from_date: new Date().toISOString().slice(0,10),
      to_date: new Date().toISOString().slice(0,10),
      time: new Date().toISOString().slice(11,19)
    };

    const response = await fetch(buildProxyUrl('bodies/positions', testParams), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('API availability check response:', response.status);
    return response.ok;

  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
}
