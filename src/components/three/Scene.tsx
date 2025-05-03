
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton, createXRStore } from '@react-three/xr';
import SolarSystem from './SolarSystem';
import { useStore } from '../../store';
import LoadingScreen from '../LoadingScreen';

import ARView from './ARView';

// Create XR store for AR session management
const xrStore = createXRStore();

const Scene = () => {
  const [started, setStarted] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);
  const isARMode = useStore(state => state.isARMode);
  const toggleARMode = useStore(state => state.toggleARMode);
  
  // Enter AR mode when isARMode changes to true
  useEffect(() => {
    if (isARMode) {
      // Attempt to enter AR mode and handle potential errors
      xrStore.enterAR().catch((error: Error) => {
        console.error('Failed to enter AR mode:', error);
        toggleARMode(); // Toggle back to non-AR if AR fails
        alert('AR mode is not supported on this device or browser');
      });
    }
  }, [isARMode, toggleARMode]);
  
  // Log XR session status changes for debugging
  useEffect(() => {
    const handleSessionChange = (supported: boolean) => {
      console.log('AR supported:', supported);
    };
    
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then(handleSessionChange);
    }
  }, []);
  
  const handleSceneLoaded = () => {
    setStarted(true);
    initializeAudio();
  };
  
  return (
    <div className="fixed inset-0">
      {!isARMode && <LoadingScreen started={started} />}
      
      {/* ARButton from react-three/xr provides a browser-compatible AR session button */}
      <div className="fixed top-4 right-4 z-50">
        <ARButton 
          className={`${isARMode ? 'ar-ui' : ''}`}
          store={xrStore} 
          onClick={() => {
            if (!isARMode) {
              toggleARMode();
            } else {
              xrStore.exitAR();
              toggleARMode();
            }
          }}
        >
          {isARMode ? '❌ Exit AR' : '👓 Enter AR'}
        </ARButton>
      </div>
      
      <Canvas
        shadows
        className={`w-full h-full ${isARMode ? 'ar-overlay' : ''}`}
        camera={{ 
          position: isARMode ? [0, 1.5, 0] : [0, 100, 300], 
          fov: isARMode ? 75 : 45 
        }}
      >
        <XR store={xrStore}>
          {/* XR content here */}
          <Suspense fallback={null}>
            {isARMode ? (
              <ARView>
                <SolarSystem 
                  onLoaded={handleSceneLoaded} 
                  isARMode={isARMode} 
                />
              </ARView>
            ) : (
              <SolarSystem 
                onLoaded={handleSceneLoaded} 
                isARMode={isARMode} 
              />
            )}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
};

export default Scene;