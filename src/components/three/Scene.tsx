import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import SolarSystem from './SolarSystem';
import LoadingScreen from '../LoadingScreen';
import { useStore } from '../../store';

const Scene = () => {
  const [started, setStarted] = useState(false);
  const initializeAudio = useStore(state => state.initializeAudio);

  const handleSceneLoaded = () => {
    setTimeout(() => {
      setStarted(true);
      initializeAudio();
    }, 1000);
  };

  return (
    <>
      <LoadingScreen started={started} />
      <Canvas
        shadows
        className="w-full h-full"
        camera={{ position: [0, 30, 80], fov: 45 }}
      >
        <Suspense fallback={null}>
          <SolarSystem onLoaded={handleSceneLoaded} />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;
