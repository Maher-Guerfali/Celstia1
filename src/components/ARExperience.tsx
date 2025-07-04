import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, Controllers, Hands } from '@react-three/xr';
import { Suspense } from 'react';
import SolarSystem from './three/SolarSystem';
import { useStore } from '../store';

const ARExperience = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);
  
  const handleLoaded = () => {
    setIsLoaded(true);
    initializeAudio();
  };
  
  useEffect(() => {
    // Log when AR experience is mounted
    console.log('AR Experience component mounted');
    
    return () => {
      console.log('AR Experience component unmounted');
    };
  }, []);
  
  return (
    <div className="fixed inset-0 ar-overlay">
      <Canvas
        shadows
        camera={{
          position: [0, 1.5, 0],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        className="w-full h-full"
      >
        <XR>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 5, 0]} intensity={1} />
            
            <Controllers />
            <Hands />
            
            {/* Position solar system in front of the user */}
            <group position={[0, -0.5, -3]} scale={0.3} rotation={[0, Math.PI / 4, 0]}>
              <SolarSystem 
                onLoaded={handleLoaded}
                isARMode={true}
              />
            </group>
          </Suspense>
        </XR>
      </Canvas>
      
      {!isLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
          <div className="text-white text-center p-4">
            <div className="mb-4 text-xl">Loading AR Experience...</div>
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARExperience;
