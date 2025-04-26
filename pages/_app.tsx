import { useState, useEffect } from 'react';
import Scene from '../src/components/three/Scene';
import Logo from '../src/components/Logo';
import Controls from '../src/components/Controls';
import PlanetInfo from '../src/components/PlanetInfo';
import { useStore } from '../src/store';
import { findCelestialBodyById } from '../src/data/celestialBodies';
import { CelestialBodyData } from '../src/types';
import '../src/index.css';

function App() {
  const [planetData, setPlanetData] = useState<CelestialBodyData | null>(null);
  const selectedBody = useStore(state => state.selectedBody);
  
  // Update planet info when selected body changes
  useEffect(() => {
    if (selectedBody) {
      const data = findCelestialBodyById(selectedBody);
      if (data) {
        setPlanetData(data);
      }
    } else {
      setPlanetData(null);
    }
  }, [selectedBody]);
  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Logo />
      <Controls />
      <Scene />
      <PlanetInfo data={planetData} />
    </div>
  );
}

export default App;