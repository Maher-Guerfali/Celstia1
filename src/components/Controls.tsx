import { useState } from 'react';
import { Music, Orbit, Info, Glasses } from 'lucide-react';
import { useStore } from '../store';
import Tutorial from './Tutorial';
import { useRouter } from 'next/router';

const Controls = () => {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isARLoading, setIsARLoading] = useState(false);
  
  // Get state from global store
  const audioEnabled = useStore(state => state.audioEnabled);
  const showOrbits = useStore(state => state.showOrbitPaths);
  const isARMode = useStore(state => state.isARMode);
  const { toggleAudio, toggleOrbitPaths, toggleARMode } = useStore();

  const handleARToggle = async () => {
    setIsARLoading(true);
    try {
      // Check if browser supports WebXR
      if (navigator.xr && !isARMode) {
        // First request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        
        // Then check if AR is supported
        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!isSupported) {
          throw new Error('AR is not supported on this device');
        }
      }
      
      // Toggle global AR state in store
      toggleARMode();
      
      // Navigate to AR page
      router.push('/ar');
      
      // Log AR state change for debugging
      console.log('AR mode toggled to:', !isARMode);
    } catch (error) {
      console.error('Error starting AR mode:', error);
      alert('AR is not supported on this device or browser');
    }
    setIsARLoading(false);
  };

  return (
    <>
      <div className="controls">
        <button 
          className="control-btn" 
          onClick={toggleAudio}
          title={audioEnabled ? "Mute Sound" : "Enable Sound"}
        >
          <Music 
            size={18} 
            className={audioEnabled ? "text-blue-400" : "text-gray-500"}
          />
        </button>
        
        <button 
          className="control-btn" 
          onClick={toggleOrbitPaths}
          title={showOrbits ? "Hide Orbits" : "Show Orbits"}
        >
          <Orbit size={18} className={showOrbits ? "text-yellow-400" : "text-gray-500"} />
        </button>
        
        <button 
          className="control-btn" 
          onClick={() => setShowTutorial(true)}
          title="About"
        >
          <Info size={18} className="text-blue-400" />
        </button>

        <button 
          className="control-btn" 
          onClick={handleARToggle}
          disabled={isARLoading}
          title={isARMode ? "Exit AR Mode" : "Enter AR Mode"}
        >
          <Glasses
            size={18}
            className={`${isARMode ? 'text-purple-400' : 'text-gray-500'} 
              ${isARLoading ? 'opacity-50' : ''}`}
          />
        </button>
      </div>

      <Tutorial 
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
};

export default Controls;