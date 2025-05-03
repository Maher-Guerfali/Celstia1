import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import SolarSystem from './SolarSystem';
import { useStore } from '../../store';
import LoadingScreen from '../LoadingScreen';
import Controls from '../Controls';
import ARView from './ARView';

// Create XR store
const xrStore = createXRStore();

const Scene = () => {
  const [started, setStarted] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);
  const isARMode = useStore(state => state.isARMode);
  
  // Enter AR mode when isARMode changes to true
  useEffect(() => {
    if (isARMode) {
      xrStore.enterAR();
    }
  }, [isARMode]);
  
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
          {isARMode ? (
            <XR store={xrStore}>
              <ARView />
              <SolarSystem 
                onLoaded={handleSceneLoaded} 
                isARMode={isARMode} 
              />
            </XR>
          ) : (
            <SolarSystem 
              onLoaded={handleSceneLoaded} 
              isARMode={isARMode} 
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;