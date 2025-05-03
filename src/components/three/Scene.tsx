import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SolarSystem from './SolarSystem';
import { useStore } from '../../store';
import LoadingScreen from '../LoadingScreen';
import ARView from './ARView';
import Controls from '../Controls';

const Scene = () => {
  const [started, setStarted] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);
  const isARMode = useStore(state => state.isARMode);
  
  const handleSceneLoaded = () => {
    setStarted(true);
    initializeAudio();
  };
  
  return (
    <div className="fixed inset-0">
      <LoadingScreen started={started} />
      <Controls />
      <Canvas
        shadows
        className="w-full h-full"
        camera={{ 
          position: isARMode ? [0, 0, 0] : [0, 100, 300], 
          fov: isARMode ? 75 : 45 
        }}
      >
        <Suspense fallback={null}>
          {isARMode && <ARView />}
          <SolarSystem 
            onLoaded={handleSceneLoaded} 
            isARMode={isARMode} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;