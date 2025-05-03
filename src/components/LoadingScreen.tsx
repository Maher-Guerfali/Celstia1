import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  started: boolean;
}

const LoadingScreen = ({ started }: LoadingScreenProps) => {
  // Track three.js/drie loading progress
  const { progress, loaded, total } = useProgress();
  
  // Create a smoother progress animation that doesn't jump around
  const [smoothProgress, setSmoothProgress] = useState(0);
  
  // Update smooth progress to catch up with actual progress
  useEffect(() => {
    // No need to update if we're already at 100% or if started = true
    if (smoothProgress >= 100 || started) return;
    
    // Create a smoother animation to the target progress
    const targetProgress = progress;
    const diff = targetProgress - smoothProgress;
    
    // Only update if there's a meaningful difference
    if (diff > 0.5) {
      const timer = setTimeout(() => {
        setSmoothProgress(prev => Math.min(prev + Math.max(diff * 0.1, 0.5), 100));
      }, 16); // ~60fps
      
      return () => clearTimeout(timer);
    }
  }, [progress, smoothProgress, started]);
  return (
    <AnimatePresence>
      {!started && (
        <motion.div 
          className="fixed inset-0 flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-light mb-4 cosmic-glow tracking-wider">
            REACH FOR THE STARS
          </h1>
          <p className="text-sm text-gray-400 mb-8">Preparing your journey through the solar system</p>
          
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: '0%' }}
              animate={{ width: `${smoothProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            {loaded > 0 && (
              <span>{Math.round(smoothProgress)}% - Loading textures ({loaded}/{total || '?'})</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;