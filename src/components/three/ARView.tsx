import { FC, ReactNode } from 'react';
import { Interactive } from '@react-three/xr';

interface ARViewProps {
  children?: ReactNode;
}

const ARView: FC<ARViewProps> = ({ children }) => {
  return (
    <>
      {/* Environment lighting suitable for AR */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 8, 5]} intensity={1} castShadow />
      
      {/* Wrap children in Interactive component for AR interaction */}
      <Interactive>
        <group position={[0, 0, -3]} scale={0.1}>
          {children}
        </group>
      </Interactive>
    </>
  );
};

export default ARView;