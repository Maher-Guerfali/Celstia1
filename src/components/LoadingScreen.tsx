import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  started: boolean;
}

const LoadingScreen = ({ started }: LoadingScreenProps) => {
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
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;