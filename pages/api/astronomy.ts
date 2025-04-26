import axios from 'axios';

// Type definitions
export interface BodyPosition {
  x: number;
  y: number;
  z: number;
  distance: number;
  datetime: string;
  constellation?: {
    id: string;
    name: string;
    short: string;
  };
  phase?: {
    fraction: string;
    string: string;
  };
}

export interface PlanetaryPositions {
  [key: string]: BodyPosition;
}

interface AstronomyApiResponse {
  data: {
    dates: {
      from: string;
      to: string;
    };
    observer: {
      location: {
        longitude: number;
        latitude: number;
        elevation: number;
      };
    };
    rows: Array<{
      body: {
        id: string;
        name: string;
      };
      positions: Array<{
        date: string;
        id: string;
        name: string;
        distance: {
          fromEarth: {
            au: string;
            km: string;
          };
        };
        position: {
          horizontal: {
            altitude: {
              degrees: string;
              string: string;
            };
            azimuth: {
              degrees: string;
              string: string;
            };
          };
          equatorial: {
            rightAscension: {
              hours: string;
              string: string;
            };
            declination: {
              degrees: string;
              string: string;
            };
          };
          constellation: {
            id: string;
            short: string;
            name: string;
          };
        };
        extraInfo?: {
          elongation: number;
          magnitude: number;
          phase?: {
            angel: string;
            fraction: string;
            string: string;
          };
        };
      }>;
    }>;
  };
}

// Body details response type
interface BodyDetailsResponse {
  data: {
    id: string;
    name: string;
    isPlanet: boolean;
    avgTemp: number;
    mass: {
      kg: number;
      earth: number;
    };
    gravity: {
      value: number;
      unit: string;
    };
    meanRadius: {
      km: number;
      earth: number;
    };
    [key: string]: unknown;
  };
}

// API credentials
const API_KEY = process.env.NEXT_PUBLIC_ASTRONOMY_API_KEY || '';
const API_SECRET = process.env.NEXT_PUBLIC_ASTRONOMY_API_SECRET || '';

// Base configuration for API requests
const apiClient = axios.create({
  baseURL: 'https://api.astronomyapi.com/api/v2',
  headers: {
    'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Checks if the Astronomy API is available and responding
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    // Try a simple request to the API (requesting just the sun position for today)
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get('/bodies/positions/sun', {
      params: {
        latitude: '0',
        longitude: '0',
        elevation: '0',
        from_date: today,
        to_date: today,
        time: '12:00:00'
      },
      timeout: 5000 // 5 second timeout for availability check
    });
    
    return response.status === 200;
  } catch (error) {
    console.warn('Astronomy API check failed:', error);
    return false;
  }
};

/**
 * Converts equatorial coordinates (RA/Dec) to cartesian coordinates (x,y,z)
 */
const equatorialToCartesian = (
  rightAscension: number,  // in hours
  declination: number,     // in degrees
  distance: number         // in AU
): { x: number, y: number, z: number } => {
  // Convert hours to degrees for right ascension
  const ra = rightAscension * 15;
  
  // Convert to radians
  const raRad = (ra * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  
  // Calculate cartesian coordinates
  // x-axis: points to the vernal equinox (RA = 0h)
  // y-axis: points to RA = 6h
  // z-axis: points to the celestial north pole
  return {
    x: distance * Math.cos(decRad) * Math.cos(raRad),
    y: distance * Math.sin(decRad),
    z: -distance * Math.cos(decRad) * Math.sin(raRad) // Negative to match three.js coordinate system
  };
};

/**
 * Retrieves the positions of celestial bodies from the Astronomy API
 */
export const getBodyPositions = async (): Promise<PlanetaryPositions> => {
  const positions: PlanetaryPositions = {};
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const timeString = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  
  // Bodies to fetch positions for
  const bodies = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  
  // Set observer location (using Greenwich as default)
  const latitude = '51.4769';
  const longitude = '0.0005';
  const elevation = '0';
  
  try {
    // Fetch each body's position
    const promises = bodies.map(async (body) => {
      try {
        const response = await apiClient.get<AstronomyApiResponse>(`/bodies/positions/${body}`, {
          params: {
            latitude,
            longitude,
            elevation,
            from_date: dateString,
            to_date: dateString,
            time: timeString
          }
        });
        
        // Process the response
        if (response.data && response.data.data && response.data.data.rows.length > 0) {
          const bodyData = response.data.data.rows[0];
          const positionData = bodyData.positions[0];
          
          if (positionData) {
            const distanceAU = parseFloat(positionData.distance.fromEarth.au);
            const ra = parseFloat(positionData.position.equatorial.rightAscension.hours);
            const dec = parseFloat(positionData.position.equatorial.declination.degrees);
            
            // Convert to cartesian coordinates
            const { x, y, z } = equatorialToCartesian(ra, dec, distanceAU);
            
            // Special case for the sun - it should be at the center
            if (body === 'sun') {
              positions[body] = {
                x: 0,
                y: 0,
                z: 0,
                distance: 0,
                datetime: positionData.date,
                constellation: positionData.position.constellation
              };
            } else {
              positions[body] = {
                x, 
                y, 
                z,
                distance: distanceAU,
                datetime: positionData.date,
                constellation: positionData.position.constellation,
                phase: positionData.extraInfo?.phase
              };
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching position for ${body}:`, error);
      }
    });
    
    await Promise.all(promises);
    return positions;
    
  } catch (error) {
    console.error('Failed to fetch planetary positions:', error);
    throw new Error('Failed to fetch planetary positions from Astronomy API');
  }
};

/**
 * Retrieves detailed information about a specific celestial body
 */
export const getBodyDetails = async (bodyId: string): Promise<BodyDetailsResponse['data']> => {
  try {
    const response = await apiClient.get<BodyDetailsResponse>(`/bodies/${bodyId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching details for ${bodyId}:`, error);
    throw error;
  }
};