import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CelestialBodyData } from '../types';
import { useStore } from '../store';

interface PlanetInfoProps {
  data: CelestialBodyData | null;
}

// Using React.memo to prevent unnecessary re-renders
const PlanetInfo = memo(({ data }: PlanetInfoProps) => {
  const isInfoPanelVisible = useStore((state) => state.isInfoPanelVisible);
  const clearSelectedBody = useStore((state) => state.clearSelectedBody);
  
  // If no data or panel closed, render nothing
  if (!data || !isInfoPanelVisible) return null;
  
  // Handle close button click
  const handleClose = () => {
    clearSelectedBody(); // This will clear selection and hide the panel
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 left-4 lg:left-8 max-w-md glassmorphic p-6 z-10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ 
          type: 'spring', 
          damping: 25, 
          stiffness: 300,
          // Critical performance optimization: use GPU acceleration
          translateY: [100, 0],
          opacity: [0, 1] 
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-medium cosmic-glow">{data.name}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Mass</p>
              <p>{data.mass}</p>
            </div>
            <div>
              <p className="text-gray-400">Age</p>
              <p>{data.age}</p>
            </div>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Composition</p>
            <ul className="list-disc list-inside pl-2 text-sm">
              {(data.materials ?? []).map((material, index) => (
                <li key={index}>{material}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <p className="text-gray-400 mb-1">Description</p>
            <p className="text-sm">{data.description}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default PlanetInfo;