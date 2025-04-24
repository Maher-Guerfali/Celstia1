import { useEffect } from 'react';
import { useStore } from './store';
import Scene from './components/three/Scene';
import Logo from './components/Logo';
import Controls from './components/Controls';
import PlanetInfo from './components/PlanetInfo';
import NasaAttribution from './components/NasaAttribution';
import { celestialBodies } from './data/celestialBodies';

function App() {
  const initializeAudio = useStore(state => state.initializeAudio);
  
  // Run only once when component mounts
  useEffect(() => {
    const initialize = () => {
      initializeAudio();
      document.removeEventListener('click', initialize);
    };
    
    document.addEventListener('click', initialize, { once: true });
    return () => document.removeEventListener('click', initialize);
  }, []);

  const selectedBody = useStore(state => state.selectedBody);
  const planetData = celestialBodies.find(body => body.id === selectedBody) || null;
  
  return (
    <div className="w-full h-screen relative">
      <div className="scene-container">
        <Scene />
      </div>
      
      <div className="ui-layer">
        <Logo />
        <Controls />
        <PlanetInfo data={planetData} />
        <NasaAttribution />
      </div>
    </div>
  );
}

export default App;