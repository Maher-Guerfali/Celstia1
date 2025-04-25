// Create a new file: pages/api/astronomy.js (for Next.js) or equivalent for your framework

import CryptoJS from 'crypto-js';

// Store these in environment variables, not in code
const API_URL = process.env.ASTRONOMY_API_URL || 'https://api.astronomyapi.com/api/v2';
const APP_ID = process.env.ASTRONOMY_APP_ID;
const APP_SECRET = process.env.ASTRONOMY_APP_SECRET;

// Create authentication hash
const getAuthHeaders = () => {
  const date = new Date().toUTCString();
  const hash = CryptoJS.HmacSHA256(date, APP_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  return {
    'Authorization': `Basic ${Buffer.from(`${APP_ID}:${signature}`).toString('base64')}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Date': date,
    'Content-Type': 'application/json'
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get current date and observer coordinates
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toISOString().split('T')[1].split('.')[0];
    
    // Use fixed observer location
    const latitude = 40.7128;
    const longitude = -74.0060;
    
    // Bodies to fetch
    const bodies = [
      'sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
    ];
    
    const response = await fetch(`${API_URL}/bodies/positions`, {
      method: 'POST',
      headers: getAuthHeaders(),
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
    const positions = {};
    
    data.data.table.rows.forEach((row) => {
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
    
    res.status(200).json({ positions });
  } catch (error) {
    console.error('Error fetching from Astronomy API:', error);
    res.status(500).json({ error: 'Failed to fetch astronomical data' });
  }
}