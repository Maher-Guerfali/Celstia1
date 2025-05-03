import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useStore } from '../src/store';

// Import AR components only on client-side - ensure we avoid SSR
const ARExperience = dynamic(
  () => import(`${process.cwd()}/src/components/ARExperience`).then(mod => mod.default).catch(err => {
    console.error('Failed to load AR experience:', err);
    // Fallback component if import fails
    return () => <div className="p-8 text-white">AR Experience failed to load</div>;
  }),
  { ssr: false, loading: () => <div className="p-8 text-white">Loading AR Experience...</div> }
);

export default function ARPage() {
  const router = useRouter();
  const isARMode = useStore(state => state.isARMode);
  
  // Redirect to home if not in AR mode
  useEffect(() => {
    if (!isARMode) {
      router.push('/');
    }
  }, [isARMode, router]);
  
  // Handle escape key to exit AR mode
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        useStore.getState().toggleARMode();
        router.push('/');
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [router]);
  
  return (
    <div className="ar-page fixed inset-0">
      <ARExperience />
      
      {/* AR Exit Button */}
      <button 
        onClick={() => {
          useStore.getState().toggleARMode();
          router.push('/');
        }}
        className="fixed top-4 right-4 z-50 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all text-white"
      >
        ❌ Exit AR
      </button>
    </div>
  );
}
