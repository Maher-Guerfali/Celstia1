import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Logo from '../src/components/Logo';
import Controls from '../src/components/Controls';
import PlanetInfo from '../src/components/PlanetInfo';
import NasaAttribution from '../src/components/NasaAttribution';
import { useStore } from '../src/store';
import { celestialBodies } from '../src/data/celestialBodies';

// Dynamically import Scene component with SSR disabled
const Scene = dynamic(() => import('../src/components/three/Scene'), {
  ssr: false
});

export default function Home() {
  const initializeAudio = useStore(state => state.initializeAudio);
  const selectedBody = useStore(state => state.selectedBody);
  const clearSelectedBody = useStore(state => state.clearSelectedBody);
  const planetData = celestialBodies.find(body => body.id === selectedBody) || null;
  
  useEffect(() => {
    const initialize = () => {
      initializeAudio();
      document.removeEventListener('click', initialize);
    };
    
    document.addEventListener('click', initialize, { once: true });
    return () => document.removeEventListener('click', initialize);
  }, [initializeAudio]);

  // Handle background clicks (outside of the 3D scene)
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only handle direct clicks on the main container
    if (e.target === e.currentTarget && selectedBody) {
      clearSelectedBody();
    }
  };

  return (
    <div className="w-full h-screen relative" onClick={handleBackgroundClick}>
      <Scene />
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <Logo />
          <Controls />
          <PlanetInfo data={planetData} />
          <NasaAttribution />
        </div>
      </div>
    </div>
  );
}