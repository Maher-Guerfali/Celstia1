// File: src/services/astronomyApi.ts

// Utility to build proxy URL for serverless function
const buildProxyUrl = (path: string, params: Record<string, string | number> = {}) => {
  const query = new URLSearchParams({ path, ...Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ) });
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

export async function getBodyPositions(): Promise<PlanetaryPositions> {
  const now = new Date();
  const date = now.toISOString().slice(0,10);
  const time = now.toISOString().slice(11,19);

  const response = await fetch(buildProxyUrl('bodies/positions'), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      observer: { latitude: 40.7128, longitude: -74.0060, elevation: 0 },
      bodies: ['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune','pluto'],
      from_date: date,
      to_date: date,
      time,
    }),
  });
  if (!response.ok) throw new Error(response.statusText);
  const { data } = await response.json();

  const positions: PlanetaryPositions = {};
  data.table.rows.forEach((row: any) => {
    const id = row.entry.id.toLowerCase();
    const cell = row.cells?.[0];
    if (!cell?.position) return;
    const eq = cell.position.equatorial;
    const ra = (parseFloat(eq.rightAscension.hours) * 15 + parseFloat(eq.rightAscension.minutes) / 4 + parseFloat(eq.rightAscension.seconds) / 240) * Math.PI/180;
    const dec = (parseFloat(eq.declination.degrees) + parseFloat(eq.declination.minutes)/60 + parseFloat(eq.declination.seconds)/3600) * Math.PI/180;
    const dist = parseFloat(cell.distance.fromEarth.au);
    positions[id] = {
      x: dist * Math.cos(dec) * Math.cos(ra),
      y: dist * Math.sin(dec),
      z: dist * Math.cos(dec) * Math.sin(ra),
      distance: dist,
      datetime: new Date().toISOString(),
    };
  });
  if (!positions.earth) positions.earth = { x:0,y:0,z:0,distance:0,datetime:new Date().toISOString() };
  return positions;
}

// Fetch position for a specific body using GET method
// Based on GET https://api.astronomyapi.com/api/v2/bodies/positions/:body endpoint
export const getBodyPosition = async (
  bodyId: string,
  latitude: number,
  longitude: number,
  elevation: number = 0,
  date: string = new Date().toISOString().slice(0,10),
  time: string = new Date().toISOString().slice(11,19)
): Promise<any> => {
  // Format date parameters
  const from_date = date;
  const to_date = date; // Same day for single position

  const params = {
    latitude,
    longitude,
    elevation,
    from_date,
    to_date,
    time
  };

  const url = buildProxyUrl(`bodies/positions/${bodyId}`, params);
  
  const response = await fetch(url);
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
    time
  };

  const url = buildProxyUrl(`bodies/positions/${bodyId}`, params);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  
  const data = await response.json();
  return data.data.rows[0]; // Contains the body with all position entries
}

export async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch(buildProxyUrl('studio/star-chart'));
    return response.ok;
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
}