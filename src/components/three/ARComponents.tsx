import { FC, ReactNode, useEffect } from 'react';
import { XR, useXR, Interactive, Controllers, Hands } from '@react-three/xr';
import { useStore } from '../../store';

interface ARComponentsProps {
  children?: ReactNode;
}

// AR Session component that handles the XR session and store updates
const ARComponents: FC<ARComponentsProps> = ({ children }) => {
  const { isPresenting } = useXR();
  const toggleARMode = useStore(state => state.toggleARMode);
  const isARMode = useStore(state => state.isARMode);

  // Keep AR mode state in sync with XR session state
  useEffect(() => {
    if (isPresenting !== isARMode) {
      toggleARMode();
    }
  }, [isPresenting, isARMode, toggleARMode]);

  return (
    <XR>
      {/* AR View with children */}
      <ARView>{children}</ARView>
    </XR>
  );
};

// AR View component for positioning content in AR space
const ARView: FC<{ children?: ReactNode }> = ({ children }) => {
  return (
    <>
      {/* AR-specific lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />
      
      <Controllers />
      <Hands />
      
      {/* Position and scale for AR viewing */}
      <Interactive onSelect={() => console.log('AR object selected')}>
        <group position={[0, -1, -5]} scale={0.1}>
          {children}
        </group>
      </Interactive>
    </>
  );
};

export default ARComponents;
