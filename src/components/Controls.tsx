import { useState } from 'react';
import { Music, Orbit, Info, Glasses } from 'lucide-react';
import { useStore } from '../store';
import Tutorial from './Tutorial';

const Controls = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [isARMode, setIsARMode] = useState(false);
  const [isARLoading, setIsARLoading] = useState(false);
  const audioEnabled = useStore(state => state.audioEnabled);
  const showOrbits = useStore(state => state.showOrbitPaths);
  const { toggleAudio, toggleOrbitPaths } = useStore();

  const handleARToggle = async () => {
    setIsARLoading(true);
    try {
      if (!isARMode) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      }
      setIsARMode(!isARMode);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access is required for AR mode');
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