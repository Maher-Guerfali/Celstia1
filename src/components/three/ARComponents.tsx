import { FC, ReactNode } from 'react';
import { XR, createXRStore } from '@react-three/xr';
import ARView from './ARView';

// Create XR store for AR session management
// This store will only be created on the client side due to dynamic import
const xrStore = createXRStore();

interface ARComponentsProps {
  children?: ReactNode;
}

const ARComponents: FC<ARComponentsProps> = ({ children }) => {
  return (
    <XR store={xrStore}>
      <ARView>
        {children}
      </ARView>
    </XR>
  );
};

export default ARComponents;
