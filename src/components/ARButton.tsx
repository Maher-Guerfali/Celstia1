import { useState } from 'react';
import { Glasses } from 'lucide-react';

interface ARButtonProps {
  onToggleAR: () => void;
  isARMode: boolean;
}

const ARButton = ({ onToggleAR, isARMode }: ARButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Request camera permissions
      if (!isARMode) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      }
      onToggleAR();
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access is required for AR mode');
    }
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="control-btn"
      title={isARMode ? "Exit AR Mode" : "Enter AR Mode"}
    >
      <Glasses
        size={18}
        className={`${isARMode ? 'text-purple-400' : 'text-gray-500'} 
          ${isLoading ? 'opacity-50' : ''}`}
      />
    </button>
  );
};

export default ARButton;
