import { CelestialBodyData } from '../types';

export const celestialBodies: CelestialBodyData[] = [
  {
    id: 'sun',
    name: 'Sun',
    mass: '1.989 × 10^30 kg',
    age: '4.6 billion years',
    materials: ['Hydrogen (73%)', 'Helium (25%)', 'Other elements (2%)'],
    description: 'The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core. The Sun radiates energy mainly as light, ultraviolet, and infrared radiation, and is the most important source of energy for life on Earth.',
    texture: 'https://www.shutterstock.com/shutterstock/videos/1107387031/thumb/1.jpg?ip=x480',
    radius: 7,
    orbitPeriod:1,
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
    description: 'Mercury is the smallest and innermost planet in the Solar System. It has no natural satellites and is one of the four terrestrial planets in our solar system. Mercury has a thin atmosphere, which results in temperature extremes and the lack of an ability to retain heat during its night.',
    texture: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg',
    radius: 0.38,
    orbitRadius: 10,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
     color: '#FDB813'
  },
  {
    id: 'venus',
    name: 'Venus',
    mass: '4.8675 × 10^24 kg',
    age: '4.5 billion years',
    materials: ['Carbon dioxide', 'Nitrogen', 'Sulfur dioxide'],
    description: 'Venus is the second planet from the Sun and is Earth\'s closest planetary neighbor. It\'s one of the four inner, terrestrial planets, and it\'s often called Earth\'s twin because it\'s similar in size and density. Venus has a thick, toxic atmosphere filled with carbon dioxide and it\'s perpetually shrouded in thick, yellowish clouds of sulfuric acid.',
    texture: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/ebbf2019-9330-43af-945d-d93d81bfadc7/dg4via3-7bde39bd-4a37-4fec-8f3d-69cdd28a3ebc.png/v1/fill/w_1264,h_632,q_70,strp/venus_texture_by_planetboiearth_dg4via3-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjQwIiwicGF0aCI6IlwvZlwvZWJiZjIwMTktOTMzMC00M2FmLTk0NWQtZDkzZDgxYmZhZGM3XC9kZzR2aWEzLTdiZGUzOWJkLTRhMzctNGZlYy04ZjNkLTY5Y2RkMjhhM2ViYy5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.Uwx_XPXSbWeUfUUfY6hltnRxkp2gXblLKxB1O947IuQ',
    radius: 0.95,
    orbitRadius: 14,
    orbitSpeed: 0.015,
    rotationSpeed: 0.002
  },
  {
    id: 'earth',
    name: 'Earth',
    mass: '5.97237 × 10^24 kg',
    age: '4.54 billion years',
    materials: ['Nitrogen (78%)', 'Oxygen (21%)', 'Water', 'Minerals'],
    description: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. According to radiometric dating and other sources of evidence, Earth formed over 4.5 billion years ago. Earth\'s gravity interacts with other objects in space, especially the Sun and the Moon, Earth\'s only natural satellite.',
    texture: 'https://static.vecteezy.com/system/resources/previews/053/312/337/non_2x/stunning-animated-world-map-clouds-terrain-oceans-photo.jpeg',
    radius: 1,
    orbitRadius: 20,
    orbitSpeed: 0.01,
    rotationSpeed: 0.01,
     color: '#FDB813',
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        mass: '7.34767309 × 10^22 kg',
        age: '4.51 billion years',
        materials: ['Silicon', 'Oxygen', 'Iron', 'Magnesium'],
        description: 'The Moon is Earth\'s only natural satellite. It is the fifth largest satellite in the Solar System and the largest and most massive relative to its parent planet. The Moon is in synchronous rotation with Earth, always showing the same face.',
        texture: 'https://us1.discourse-cdn.com/flex002/uploads/shapr3d/original/2X/a/ad24c0470c10858fad6fcbe1da5f62e01310da6e.jpeg',
        radius: 0.27,
        orbitRadius: 2,
        orbitSpeed: 0.0001,
        rotationSpeed: 0.0001
      },
      {
        id: 'maher_station',
        name: 'Maher Station',
        mass: 'Unknown',
        age: '2025 CE',
        materials: ['Titanium alloy', 'Carbon fiber', 'Solar panels'],
        description: 'Maher Station is a hypothetical space station orbiting Earth. Named after its creator, it serves as a scientific research facility and potential waypoint for future space exploration missions.',
        texture: 'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg',
        radius: 0.05,
        orbitRadius: 1.5,
        orbitSpeed: 0.00015,
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
    description: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. In English, Mars carries the name of the Roman god of war and is often referred to as the "Red Planet".',
    texture: 'https://static.vecteezy.com/system/resources/thumbnails/037/481/368/small/ai-generated-seamless-texture-of-martian-surface-neural-network-generated-image-photo.jpg',
    radius: 0.53,
    orbitRadius: 26,
    orbitSpeed: 0.008,
    rotationSpeed: 0.009
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    mass: '1.8982 × 10^27 kg',
    age: '4.6 billion years',
    materials: ['Hydrogen (90%)', 'Helium (10%)', 'Trace elements'],
    description: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined.',
    texture: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5938ae9e-47de-424a-8836-f98e6658d37b/dcdpcdp-7f959f35-6b73-4660-809c-feb7cddba1ce.jpg/v1/fill/w_1920,h_960,q_75,strp/jupiter_2000_texture_map__14k__by_askaniy_dcdpcdp-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTYwIiwicGF0aCI6IlwvZlwvNTkzOGFlOWUtNDdkZS00MjRhLTg4MzYtZjk4ZTY2NThkMzdiXC9kY2RwY2RwLTdmOTU5ZjM1LTZiNzMtNDY2MC04MDljLWZlYjdjZGRiYTFjZS5qcGciLCJ3aWR0aCI6Ijw9MTkyMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.ifK4KrXEaiqXMHkkL6ChhQgxXhblY08U3ccrh3Ngt4o',
    radius: 3.8,
    orbitRadius: 36,
    orbitSpeed: 0.004,
    rotationSpeed: 0.04
  },
  {
    id: 'saturn',
    name: 'Saturn',
    mass: '5.6834 × 10^26 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (96%)', 'Helium (3%)', 'Trace elements', 'Ice rings'],
    description: 'Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. It has only one-eighth the average density of Earth; however, with its larger volume, Saturn is over 95 times more massive.',
    texture: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5938ae9e-47de-424a-8836-f98e6658d37b/dcm18ed-e543a5b4-4a57-42ce-b60f-0760ff9d0498.png/v1/fill/w_1264,h_632,q_70,strp/saturn_2018_texture_map_by_askaniy_dcm18ed-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTAwIiwicGF0aCI6IlwvZlwvNTkzOGFlOWUtNDdkZS00MjRhLTg4MzYtZjk4ZTY2NThkMzdiXC9kY20xOGVkLWU1NDNhNWI0LTRhNTctNDJjZS1iNjBmLTA3NjBmZjlkMDQ5OC5wbmciLCJ3aWR0aCI6Ijw9MTgwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.eTCM_OwuSTD59sCzBTSWIhinQnX454BGoclCXYjD2Eg',
    radius: 3.4,
    orbitRadius: 48,
    orbitSpeed: 0.0023,
    rotationSpeed: 0.038,
    hasRings: true
  },
  {
    id: 'uranus',
    name: 'Uranus',
    mass: '8.6810 × 10^25 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (83%)', 'Helium (15%)', 'Methane (2%)'],
    description: 'Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is similar in composition to Neptune, and both have bulk chemical compositions which differ from that of the larger gas giants Jupiter and Saturn.',
    texture: 'https://static.vecteezy.com/system/resources/previews/001/998/851/non_2x/abstract-background-of-uranus-surface-free-vector.jpg',
    radius: 1.8,
    orbitRadius: 60,
    orbitSpeed: 0.0014,
    rotationSpeed: 0.03
  },
  {
    id: 'neptune',
    name: 'Neptune',
    mass: '1.02413 × 10^26 kg',
    age: '4.5 billion years',
    materials: ['Hydrogen (80%)', 'Helium (19%)', 'Methane (1%)'],
    description: 'Neptune is the eighth and farthest known planet from the Sun in the Solar System. In the Solar System, it is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. Neptune is 17 times the mass of Earth, slightly more massive than its near-twin Uranus.',
    texture: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg',
    radius: 1.8,
    orbitRadius: 72,
    orbitSpeed: 0.0008,
    rotationSpeed: 0.032
  },
  {
    id: 'pluto',
    name: 'Pluto',
    mass: '1.303 × 10^22 kg',
    age: '4.6 billion years',
    materials: ['Nitrogen ice', 'Methane ice', 'Carbon monoxide ice'],
    description: 'Pluto is a dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune. It was the first and the largest Kuiper belt object to be discovered. After Pluto was discovered in 1930, it was declared to be the ninth planet from the Sun. Beginning in the 1990s, its status as a planet was questioned following the discovery of several objects of similar size in the Kuiper belt.',
    texture: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5938ae9e-47de-424a-8836-f98e6658d37b/dcjk44z-9fa15d34-cee7-47b1-a497-f103d8df2454.jpg/v1/fill/w_1920,h_960,q_75,strp/pluto_texture_map__25k__by_askaniy_dcjk44z-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTYwIiwicGF0aCI6IlwvZlwvNTkzOGFlOWUtNDdkZS00MjRhLTg4MzYtZjk4ZTY2NThkMzdiXC9kY2prNDR6LTlmYTE1ZDM0LWNlZTctNDdiMS1hNDk3LWYxMDNkOGRmMjQ1NC5qcGciLCJ3aWR0aCI6Ijw9MTkyMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.SFhvCES9SCvWvGQfo4nI-f0yK2c7e0CfmH_2trqSq5U',
    radius: 0.18,
    orbitRadius: 84,
    orbitSpeed: 0.0004,
    rotationSpeed: 0.003,

  },
  {
    id: 'black_hole',
    name: 'Black Hole',
    mass: 'Unknown (millions of solar masses)',
    age: 'Unknown (billions of years)',
    materials: ['Highly compressed matter', 'Event horizon'],
    description: 'A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole. The boundary of the region from which no escape is possible is called the event horizon.',
    texture: 'https://www.shutterstock.com/image-vector/black-spiral-hole-on-galaxy-600nw-2072407151.jpg',
    radius: 11,
    orbitRadius: 120,
    orbitSpeed: 0,
    rotationSpeed: 0.01,
    
    color: '#DD0000'
  }
];

export const findCelestialBodyById = (id: string): CelestialBodyData | undefined => {
  // First search in main celestial bodies
  const body = celestialBodies.find(body => body.id === id);
  if (body) return body;

  // If not found, search in moons
  for (const planet of celestialBodies) {
    if (planet.moons) {
      const moon = planet.moons.find(moon => moon.id === id);
      if (moon) return moon;
    }
  }
  
  return undefined;
};