

import { FC, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';

const ARView: FC<{children?: React.ReactNode}> = ({ children }) => {
  // Always call hooks unconditionally as per React's rules
  const { isPresenting } = useXR();
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, []);
  
  // Report AR status for debugging
  useEffect(() => {
    // Only run client-side code after component has mounted
    if (isBrowser && isPresenting) {
      console.log('AR session started successfully');
    }
  }, [isPresenting, isBrowser]);
  
  // Set up AR hit testing if needed
  useFrame(() => {
    if (isBrowser && isPresenting) {
      // Optional: Add custom frame-by-frame AR logic here
      // This could include placement of objects based on hit testing
    }
  });
  
  return (
    <>
      {/* AR specific controls would go here if needed */}
      
      {/* This places content in the AR world space */}
      <group position={[0, 0, -2]}> {/* Position the solar system in front of user */}
        {children}
      </group>
      
      {/* Add ground plane or reference points if needed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial transparent opacity={0.1} color="#666" />
      </mesh>
    </>
  );
};

export default ARView;
