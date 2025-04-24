import { motion } from 'framer-motion';

const NasaAttribution = () => {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 flex flex-col items-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="glassmorphic p-2 flex items-center gap-2">
        <img 
          src="https://i.ibb.co/GfJmVXGY/nasa-logo-png-seeklogo-97034-removebg-preview.png" 
          alt="NASA Logo" 
          className="h-8 w-auto filter brightness-0 invert"
        />
      </div>
      <span className="text-xs text-gray-400 mt-1">
        Real-time positions from API
      </span>
    </motion.div>
  );
};

export default NasaAttribution;