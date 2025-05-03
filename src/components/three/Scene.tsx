
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import SolarSystem from './SolarSystem';
import { useStore } from '../../store';
import LoadingScreen from '../LoadingScreen';
import dynamic from 'next/dynamic';

// Dynamically import AR components to prevent SSR issues
const ARComponents = dynamic(
  () => import('../three/ARComponents').then(mod => mod.default),
  { ssr: false }
);

const Scene = () => {
  const [started, setStarted] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);
  const isARMode = useStore(state => state.isARMode);
  
  // Check if we're in browser environment
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);
  
  // Avoid accessing browser APIs during SSR
  useEffect(() => {
    // Only execute AR-related code on the client side
    if (isBrowser && isARMode) {
      console.log('AR mode activated on client');
    }
  }, [isARMode, isBrowser]);
  
  const handleSceneLoaded = () => {
    setStarted(true);
    initializeAudio();
  };
  
  return (
    <div className="fixed inset-0">
      {!isARMode && <LoadingScreen started={started} />}
      
      {/* Toggle AR button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          className={`p-2 bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all ${isARMode ? 'ar-ui' : ''}`}
          onClick={() => useStore.getState().toggleARMode()}
        >
          {isARMode ? '❌ Exit AR' : '👓 Enter AR'}
        </button>
      </div>
      
      <Canvas
        shadows
        className={`w-full h-full ${isARMode ? 'ar-overlay' : ''}`}
        camera={{ 
          position: isARMode ? [0, 1.5, 0] : [0, 100, 300], 
          fov: isARMode ? 75 : 45 
        }}
      >
        <Suspense fallback={null}>
          {/* Conditionally render AR components only on client side */}
          {isARMode && isBrowser ? (
            <ARComponents>
              <SolarSystem 
                onLoaded={handleSceneLoaded} 
                isARMode={isARMode} 
              />
            </ARComponents>
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