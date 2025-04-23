import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TutorialProps {
  visible: boolean;
  onClose: () => void;
}

const Tutorial = ({ visible, onClose }: TutorialProps) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="glassmorphic p-6 rounded-lg max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">How to Navigate</h2>
              <button
                onClick={onClose}
                className="p-1 hover:opacity-70 transition-opacity"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-white/90">
                <p className="mb-2">• Click on planets to get more information</p>
                <p className="mb-2">• Drag with left mouse button to rotate view</p>
                <p className="mb-2">• Drag with two fingers to move camera</p>
                <p className="mb-2">• Scroll to zoom in and out</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tutorial;