import { motion } from 'framer-motion';

const NasaAttribution = () => {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="flex flex-col items-start">
        <div className="glassmorphic p-2">
          <img 
            src="https://www.nasa.gov/wp-content/uploads/2023/04/nasa-logo-web-rgb.png" 
            alt="NASA Logo" 
            className="h-6 w-auto"
          />
        </div>
        <span className="text-[10px] text-gray-400 mt-1 ml-1">
          Real-time positions from API
        </span>
      </div>
    </motion.div>
  );
};

export default NasaAttribution;