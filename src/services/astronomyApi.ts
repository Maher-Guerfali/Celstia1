// src/services/astronomyApi.ts
import CryptoJS from 'crypto-js';

const API_URL = '/api/astronomy-proxy?path=bodies/positions';  // Your Vercel route
const APP_ID = 'd9f3944f-e472-49e7-8ae1-6e460076749c';
const APP_SECRET = '93edfb2d3100068f369474bbe1ea7872ee7c730b4e83fcbcf6e9768de2c732451a68fd60ba3e0b9d6a91e9528c43d49634b12294b0d557fa86a264b2576c910fc658eceb1f3c4073335744af2575f7fa80b9aefa7e3c775d113a09dd392401c7ef14385243cd22c9285118104b81cbae';

// Create authentication hash
const getAuthHeaders = () => {
  const date = new Date().toUTCString();
  const hash = CryptoJS.HmacSHA256(date, APP_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  return {
    'Authorization': `Basic ${btoa(`${APP_ID}:${signature}`)}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Date': date,
    'Content-Type': 'application/json'
  };
};

export interface CelestialPosition {
  id: string;
  name: string;
  position: {
    equatorial: {
      rightAscension: { hours: number; minutes: number; seconds: number; },
      declination: { degrees: number; minutes: number; seconds: number; },
    },
    horizonal: {
      altitude: { degrees: number; minutes: number; seconds: number; },
      azimuth: { degrees: number; minutes: number; seconds: number; },
    },
    constellation?: {
      id: string;
      name: string;
    }
  };
  distance: number;
  extraInfo?: {
    magnitude?: number;
    elongation?: number;
  };
}

export interface PlanetaryPositions {
  [key: string]: {
    x: number;
    y: number;
    z: number;
    distance: number;
    datetime: string;
  };
}

// Fetch positions of multiple bodies
export const getBodyPositions = async (): Promise<PlanetaryPositions> => {
  try {
    console.log('🔭 Fetching positions from Astronomy API...');
    
    // Get current date and observer coordinates
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toISOString().split('T')[1].split('.')[0];
    
    // Use fixed observer location (New York City for example)
    const latitude = 40.7128;
    const longitude = -74.0060;
    
    // Bodies to fetch
    const bodies = [
      'sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
    ];
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        observer: {
          latitude: latitude,
          longitude: longitude,
          elevation: 0
        },
        bodies: bodies,
        from_date: date,
        to_date: date,
        time: time
      })
    });
    
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.table) {
      throw new Error('Invalid response format');
    }
    
    // Convert to 3D coordinates
    const positions: PlanetaryPositions = {};
    
    data.data.table.rows.forEach((row: any) => {
      const body = row.entry.name.toLowerCase();
      
      // Skip if data is missing
      if (!row.cells || !row.cells[0].position) {
        return;
      }
      
      const position = row.cells[0].position;
      const distance = row.cells[0].distance ? parseFloat(row.cells[0].distance.fromEarth.au) : 0;
      
      // Convert right ascension and declination to 3D coordinates
      const rightAscensionDegrees = position.equatorial.rightAscension.hours * 15;
      const declinationDegrees = position.equatorial.declination.degrees;
      
      // Convert to radians
      const ra = rightAscensionDegrees * Math.PI / 180;
      const dec = declinationDegrees * Math.PI / 180;
      
      // Earth is at the center for this API, so we need to offset properly
      const scaleFactor = body === 'sun' ? 0 : distance;
      
      // Convert to Cartesian coordinates
      const x = scaleFactor * Math.cos(dec) * Math.cos(ra);
      const z = scaleFactor * Math.cos(dec) * Math.sin(ra);
      const y = scaleFactor * Math.sin(dec);
      
      positions[body] = {
        x,
        y,
        z,
        distance,
        datetime: new Date().toISOString()
      };
    });
    
    // Handle special case for Earth which may not be provided directly
    if (!positions.earth) {
      positions.earth = {
        x: 0,
        y: 0,
        z: 0,
        distance: 0,
        datetime: new Date().toISOString()
      };
    }
    
    return positions;
  } catch (error) {
    console.error('❌ Error fetching from Astronomy API:', error);
    throw error;
  }
};

// Check if API is available and credentials are valid
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/studio/star-chart`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return response.ok;
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
};