const API_URL = 'https://ephemeris.kibo.cz/api/v1/planets';

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
  distance: number; // Actual distance in AU
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
    console.group('🪐 Planet Positions API Call');
    console.log('📅 Fetching positions for:', formattedDate);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

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
        topo: [0, 0, 0],
        zodiac: "tropical" // default to tropical zodiac
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !data.planets) {
      throw new Error('Invalid response format from API');
    }

    console.log('📡 Raw API response:', data);
    const positions: Record<string, PlanetPosition> = {};

    // Scale factors to make visualization more appealing
    // These are relative scale factors - actual astronomical units would make
    // outer planets too far away for visualization
    const scaleFactors = {
      Sun: 0,
      Mercury: 5,
      Venus: 8,
      Earth: 11,
      Mars: 15,
      Jupiter: 25,
      Saturn: 35,
      Uranus: 45,
      Neptune: 55,
      Pluto: 65
    };

    // Get heliocentric coordinates (xyz) if available
    if (data.planetHelio && Object.keys(data.planetHelio).length) {
      Object.entries(data.planetHelio).forEach(([name, coords]: [string, any]) => {
        if (!Array.isArray(coords) || coords.length < 3) {
          console.warn(`⚠️ Invalid heliocentric coordinates for ${name}:`, coords);
          return;
        }

        // Extract the actual distance to scale appropriately
        const [x, y, z] = coords;
        const actualDistance = Math.sqrt(x*x + y*y + z*z); // in AU
        
        // Scale for visualization
        const scaleFactor = scaleFactors[name as keyof typeof scaleFactors] || 
                          (name === 'Sun' ? 0 : 10 * (Object.keys(BODY_IDS).indexOf(name.toUpperCase()) + 1));
        
        // Scale the coordinates
        const scaledDistance = name === 'Sun' ? 0 : scaleFactor;
        const scale = actualDistance > 0 ? scaledDistance / actualDistance : 1;
        
        const position = {
          id: name.toLowerCase(),
          name,
          x: x * scale,
          y: y * scale,
          z: z * scale,
          distance: actualDistance,
          datetime: currentDate.toISOString()
        };
        
        positions[name.toLowerCase()] = position;

        console.log(`🌠 ${name} (heliocentric):`, {
          raw: coords,
          actualDistance,
          scaled: {
            distance: scaledDistance,
            x: position.x.toFixed(2),
            y: position.y.toFixed(2),
            z: position.z.toFixed(2)
          }
        });
      });
    } 
    // Fallback to ecliptic coordinates if heliocentric not available
    else {
      Object.entries(data.planets).forEach(([name, coords]: [string, any]) => {
        if (!Array.isArray(coords) || coords.length < 2) {
          console.warn(`⚠️ Invalid ecliptic coordinates for ${name}:`, coords);
          return;
        }

        const [longitude, latitude] = coords;
        // Approximate distances in AU - these are rough values for visualization
        const approxDistances = {
          Sun: 0,
          Mercury: 0.4,
          Venus: 0.7,
          Earth: 1,
          Mars: 1.5,
          Jupiter: 5.2,
          Saturn: 9.5,
          Uranus: 19.2,
          Neptune: 30.1,
          Pluto: 39.5
        };
        
        const actualDistance = approxDistances[name as keyof typeof approxDistances] || 1;
        
        // Scale for visualization
        const scaleFactor = scaleFactors[name as keyof typeof scaleFactors] || 
                          (name === 'Sun' ? 0 : 10 * (Object.keys(BODY_IDS).indexOf(name.toUpperCase()) + 1));
        
        // Convert ecliptic longitude/latitude to cartesian coordinates
        // Note: longitude is in the XZ plane, latitude is angle from XZ plane
        const lonRad = longitude * (Math.PI / 180);
        const latRad = latitude * (Math.PI / 180);
        
        const position = {
          id: name.toLowerCase(),
          name,
          x: scaleFactor * Math.cos(latRad) * Math.cos(lonRad),
          y: scaleFactor * Math.sin(latRad),
          z: scaleFactor * Math.cos(latRad) * Math.sin(lonRad),
          distance: actualDistance,
          datetime: currentDate.toISOString()
        };
        
        positions[name.toLowerCase()] = position;

        console.log(`🌍 ${name} (ecliptic):`, {
          raw: coords,
          actualDistance,
          scaled: {
            distance: scaleFactor,
            x: position.x.toFixed(2),
            y: position.y.toFixed(2),
            z: position.z.toFixed(2)
          }
        });
      });
    }

    console.log('🎯 Final positions:', positions);
    console.groupEnd();
    return positions;
    
  } catch (error: any) {
    console.group('❌ Planet Positions API Error');
    if (error.name === 'AbortError') {
      console.error('Request timed out');
    } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - Check if the API is accessible');
    } else {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
    
    console.log('⚠️ Falling back to default positions');
    return useDefaultPositions();
  }
}

function useDefaultPositions(): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};
  const date = new Date().toISOString();

  // More realistic default positions with proper orbital characteristics
  const defaultOrbits = {
    sun: { distance: 0, angle: 0 },
    mercury: { distance: 5, angle: Math.random() * Math.PI * 2 },
    venus: { distance: 8, angle: Math.random() * Math.PI * 2 },
    earth: { distance: 11, angle: Math.random() * Math.PI * 2 },
    mars: { distance: 15, angle: Math.random() * Math.PI * 2 },
    jupiter: { distance: 25, angle: Math.random() * Math.PI * 2 },
    saturn: { distance: 35, angle: Math.random() * Math.PI * 2 },
    uranus: { distance: 45, angle: Math.random() * Math.PI * 2 },
    neptune: { distance: 55, angle: Math.random() * Math.PI * 2 },
    pluto: { distance: 65, angle: Math.random() * Math.PI * 2 }
  };

  Object.entries(defaultOrbits).forEach(([id, orbit]) => {
    const name = id.charAt(0).toUpperCase() + id.slice(1);
    const { distance, angle } = orbit;
    
    // Add some inclination for realism
    const inclination = id === 'sun' ? 0 : Math.random() * 0.1 - 0.05;
    
    positions[id] = {
      id,
      name,
      x: Math.cos(angle) * distance,
      y: Math.sin(inclination) * distance,
      z: Math.sin(angle) * distance,
      distance: distance,
      datetime: date
    };
  });

  return positions;
}

// Helper function to check if the API endpoint is available
export async function checkApiAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_URL.split('/api')[0]}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API availability check failed:', error);
    return false;
  }
}