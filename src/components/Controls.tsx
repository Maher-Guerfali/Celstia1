import { useState } from 'react';
import { Music, Orbit, Info } from 'lucide-react';
import { useStore } from '../store';
import Tutorial from './Tutorial';

const Controls = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const audioEnabled = useStore(state => state.audioEnabled);
  
  const showOrbits = useStore(state => state.showOrbitPaths);
  
  const { toggleAudio, toggleOrbitPaths } = useStore();

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
      </div>

      <Tutorial 
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
};

export default Controls;