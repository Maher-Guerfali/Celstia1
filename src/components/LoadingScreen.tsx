import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  started: boolean;
}

const LoadingScreen = ({ started }: LoadingScreenProps) => {
  const { progress } = useProgress();
  
  return (
    <AnimatePresence>
      {!started && (
        <motion.div 
          className="loading-screen"
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl md:text-4xl font-light mb-4 cosmic-glow tracking-wider">
            REACH FOR THE STARS
          </h1>
          <p className="text-sm text-gray-400 mb-8">Preparing your journey through the solar system</p>
          
          <div className="loading-progress">
            <motion.div 
              className="loading-bar"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2 text-gray-500">{Math.round(progress)}% loaded</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;