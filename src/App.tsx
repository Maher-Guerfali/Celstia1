import { useState, useEffect } from 'react';
import Scene from './components/three/Scene';
import Logo from './components/Logo';
import Controls from './components/Controls';
import PlanetInfo from './components/PlanetInfo';
import { useStore } from './store';
import { findCelestialBodyById } from './data/celestialBodies';
import { CelestialBodyData } from './types';

function App() {
  const [planetData, setPlanetData] = useState<CelestialBodyData | null>(null);
  const [showPlanetInfo, setShowPlanetInfo] = useState(false);
  const selectedBody = useStore(state => state.selectedBody);
  
  // Update planet info when selected body changes
  useEffect(() => {
    if (selectedBody) {
      const data = findCelestialBodyById(selectedBody);
      if (data) {
        setPlanetData(data);
        setShowPlanetInfo(true);
      }
    }
  }, [selectedBody]);
  
  const handleClosePlanetInfo = () => {
    setShowPlanetInfo(false);
    // Don't reset selectedBody when closing the panel
  };
  
  return (
    <div className="w-full h-screen relative">
      <div className="scene-container">
        <Scene />
      </div>
      
      <div className="ui-layer">
        <Logo />
        <Controls />
        <PlanetInfo 
          data={planetData} 
          onClose={handleClosePlanetInfo} 
          visible={showPlanetInfo} 
        />
      </div>
    </div>
  );
}

export default App;