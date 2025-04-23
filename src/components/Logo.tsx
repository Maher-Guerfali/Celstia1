import { GlobeIcon, Coffee } from 'lucide-react';

const Logo = () => {
  const handleWebsiteClick = () => {
    window.open('https://mahergrf.com', '_blank', 'noopener,noreferrer');
  };

  const handleCoffeeClick = () => {
    window.open('https://buymeacoffee.com/elkarrita', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed top-4 right-4 flex gap-4">
      <div className="relative group">
        <button 
          onClick={handleWebsiteClick}
          className="glassmorphic px-3 py-2 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Visit website"
        >
          <GlobeIcon size={18} className="text-blue-400" />
          <span className="text-sm text-white">mahergrf.com</span>
        </button>
        <div className="absolute right-0 -bottom-8 scale-0 group-hover:scale-100 transition-transform origin-top p-2 bg-black/80 rounded text-xs text-white whitespace-nowrap">
          Visit my website
        </div>
      </div>

      <div className="relative group">
        <button 
          onClick={handleCoffeeClick}
          className="glassmorphic px-3 py-2 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Buy me a coffee"
        >
          <Coffee size={18} className="text-yellow-400" />
          <span className="text-sm text-white">Buy me a coffee</span>
        </button>
        <div className="absolute right-0 -bottom-8 scale-0 group-hover:scale-100 transition-transform origin-top p-2 bg-black/80 rounded text-xs text-white whitespace-nowrap">
          Support my work
        </div>
      </div>
    </div>
  );
};

export default Logo;