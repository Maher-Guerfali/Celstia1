import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ARView = () => {
  const { camera } = useThree();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let videoStream: MediaStream | null = null;

    const setupAR = async () => {
      try {
        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          }
        });
        
        videoStream = stream;

        // Create video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        video.autoplay = true;
        videoRef.current = video;

        // Wait for video to be ready
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve);
          };
        });

        // Create background plane
        const geometry = new THREE.PlaneGeometry(2, 2);
        const texture = new THREE.VideoTexture(video);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.z = -1;
        camera.add(plane);

        // Update camera settings for AR
        camera.position.set(0, 0, 0);
        camera.lookAt(0, 0, -1);
      } catch (error) {
        console.error('Error setting up AR:', error);
      }
    };

    setupAR();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [camera]);

  return null;
};

export default ARView;
