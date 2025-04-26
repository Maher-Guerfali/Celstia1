import { CelestialBodyData } from '../types';

// Real astronomical data (in km)
const REAL_DATA = {
  diameters: {
    sun: 1392700,
    mercury: 4879,
    venus: 12104,
    earth: 12756,
    mars: 6792,
    jupiter: 62984,
    saturn: 70536,
    uranus: 51118,
    neptune: 49528,
    pluto: 2376
  },
  distances: {
    mercury: 257.9,    // 57.9 + 100
    venus: 308.2,      // 108.2 + 100
    earth: 349.6,      // 149.6 + 100
    mars: 427.9,       // 227.9 + 100
    jupiter: 978.6,    // 778.6 + 100
    saturn: 1633.5,    // 1433.5 + 100
    uranus: 3072.5,    // 2872.5 + 100
    neptune: 4695.1,   // 4495.1 + 100
    pluto: 6106.4      // 5906.4 + 100
  }
};

// Scaling factors
const DISTANCE_SCALE = 0.5;
const SIZE_SCALE = 0.5;
const SUN_SCALE = 0.12;
const BASE_SCALE = 1/10;
const EARTH_RADIUS = 1;


// Planet Textures (replace with your own if needed)
const TEXTURES = {
  sun: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  mercury: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  venus: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  earth: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  moon: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  mars: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  jupiter: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  saturn: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  uranus: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  neptune: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  pluto: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  black_hole: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
  maher_station: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480'
};



export const celestialBodies: CelestialBodyData[] = [
  {
    id: 'sun',
    name: 'Sun',
    mass: '1.989 × 10^30 kg',
    age: '4.6 billion years',
    materials: ['Hydrogen (73%)', 'Helium (25%)', 'Other elements (2%)'],
    description: 'The Sun is the star at the center of the Solar System...',
    texture: TEXTURES.sun,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.sun / REAL_DATA.diameters.earth) * SIZE_SCALE * SUN_SCALE,
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.004,
    color: '#FDB813'
  },
  {
    id: 'mercury',
    name: 'Mercury',
    mass: '3.3011 × 10^23 kg',
    age: '4.5 billion years',
    materials: ['Iron (70%)', 'Silicates', 'Oxides'],
    description: 'Mercury is the smallest and innermost planet...',
    texture: TEXTURES.mercury,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.mercury / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.mercury * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
    color: '#A9A9A9'
  },
  {
    id: 'venus',
    name: 'Venus',
    mass: '4.8675 × 10^24 kg',
    age: '4.5 billion years',
    materials: ['Carbon dioxide', 'Nitrogen', 'Sulfur dioxide'],
    description: 'Venus is the second planet from the Sun...',
    texture: TEXTURES.venus,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.venus / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.venus * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.015,
    rotationSpeed: 0.002,
    color: '#E8CACA'
  },
  {
    id: 'earth',
    name: 'Earth',
    mass: '5.97237 × 10^24 kg',
    age: '4.54 billion years',
    materials: ['Nitrogen (78%)', 'Oxygen (21%)', 'Water', 'Minerals'],
    description: 'Earth is the third planet from the Sun and the only known planet to harbor life...',
    texture: TEXTURES.earth,
    radius: EARTH_RADIUS,
    orbitRadius: REAL_DATA.distances.earth * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.01,
    rotationSpeed: 0.01,
    color: '#6B93D6',
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        mass: '7.34767309 × 10^22 kg',
        age: '4.51 billion years',
        materials: ['Silicon', 'Oxygen', 'Iron', 'Magnesium'],
        description: 'The Moon is Earth\'s only natural satellite...',
        texture: TEXTURES.moon,
        radius: 0.27,
        orbitRadius: 2,
        orbitSpeed: 0.03,
        rotationSpeed: 0.0001
      },
      {
        id: 'maher_station',
        name: 'Maher Station',
        mass: 'Unknown',
        age: '2025 CE',
        materials: ['Titanium alloy', 'Carbon fiber', 'Solar panels'],
        description: 'Maher Station is a scientific research station orbiting Earth...',
        texture: TEXTURES.maher_station,
        radius: 0.05,
        orbitRadius: 1.5,
        orbitSpeed: 0.04,
        rotationSpeed: 0.0002
      }
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    mass: '6.4171 × 10^23 kg',
    age: '4.6 billion years',
    materials: ['Iron oxide', 'Silicon dioxide', 'Dust'],
    description: 'Mars is the fourth planet from the Sun...',
    texture: TEXTURES.mars,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.mars / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.mars * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.008,
    rotationSpeed: 0.009,
    color: '#E27B58'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    mass: '1.8982 × 10^27 kg',
    age: '4.6 billion years',
    materials: ['Hydrogen (90%)', 'Helium (10%)', 'Trace elements'],
    description: 'Jupiter is the fifth planet and the largest in the Solar System...',
    texture: TEXTURES.jupiter,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.jupiter / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.jupiter * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.004,
    rotationSpeed: 0.04,
    color: '#C3A992'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    mass: '5.6834 × 10^26 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (96%)', 'Helium (3%)', 'Ice rings'],
    description: 'Saturn is the sixth planet from the Sun...',
    texture: TEXTURES.saturn,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.saturn / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.saturn * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.0023,
    rotationSpeed: 0.038,
    hasRings: true,
    color: '#E3DCCB'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    mass: '8.6810 × 10^25 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (83%)', 'Helium (15%)', 'Methane (2%)'],
    description: 'Uranus is the seventh planet from the Sun...',
    texture: TEXTURES.uranus,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.uranus / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.uranus * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.0014,
    rotationSpeed: 0.03,
    color: '#CAE1E9'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    mass: '1.02413 × 10^26 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1%)'],
    description: 'Neptune is the eighth and farthest planet from the Sun...',
    texture: TEXTURES.neptune,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.neptune / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.neptune * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.0008,
    rotationSpeed: 0.032,
    color: '#5B5DDF'
  },
  {
    id: 'pluto',
    name: 'Pluto',
    mass: '1.303 × 10^22 kg',
    age: '4.6 billion years',
    materials: ['Nitrogen ice', 'Methane ice', 'Carbon monoxide ice'],
    description: 'Pluto is a dwarf planet in the Kuiper belt...',
    texture: TEXTURES.pluto,
    radius: EARTH_RADIUS * (REAL_DATA.diameters.pluto / REAL_DATA.diameters.earth) * SIZE_SCALE,
    orbitRadius: REAL_DATA.distances.pluto * BASE_SCALE * DISTANCE_SCALE,
    orbitSpeed: 0.0004,
    rotationSpeed: 0.003,
    color: '#BDB5AB'
  },
  {
    id: 'black_hole',
    name: 'Black Hole',
    mass: 'Unknown (millions of solar masses)',
    age: 'Unknown (billions of years)',
    materials: ['Highly compressed matter', 'Event horizon'],
    description: 'A black hole is a region of spacetime where gravity is so strong...',
    texture: TEXTURES.black_hole,
    radius: 4,
    orbitRadius: REAL_DATA.distances.pluto * BASE_SCALE * DISTANCE_SCALE * 1.5,
    orbitSpeed: 0,
    rotationSpeed: 0.01,
    color: '#000000'
  }
];

export const findCelestialBodyById = (id: string): CelestialBodyData | undefined => {
  const body = celestialBodies.find(body => body.id === id);
  if (body) return body;

  for (const planet of celestialBodies) {
    if (planet.moons) {
      const moon = planet.moons.find(moon => moon.id === id);
      if (moon) return moon;
    }
  }
  
  return undefined;
};
