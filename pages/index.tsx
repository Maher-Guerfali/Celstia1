    import React, { useEffect } from 'react';
    import dynamic from 'next/dynamic';
    import Logo from '../src/components/Logo';
    import Controls from '../src/components/Controls';
    import PlanetInfo from '../src/components/PlanetInfo';
    import NasaAttribution from '../src/components/NasaAttribution';
    import { useStore } from '../src/store';
    import { celestialBodies } from '../src/data/celestialBodies';

    // Dynamically import Scene component with SSR disabled
    const Scene = dynamic(() => import('../src/components/three/Scene'), {
    ssr: false
    });

    export default function Home() {
    const initializeAudio = useStore(state => state.initializeAudio);
    const selectedBody = useStore(state => state.selectedBody);
    const planetData = celestialBodies.find(body => body.id === selectedBody) || null;
    
    useEffect(() => {
        const initialize = () => {
        initializeAudio();
        document.removeEventListener('click', initialize);
        };
        
        document.addEventListener('click', initialize, { once: true });
        return () => document.removeEventListener('click', initialize);
    }, [initializeAudio]);

    return (
        <div className="w-full h-screen relative">
        <div className="scene-container">
            <Scene />
        </div>
        
        <div className="ui-layer">
            <Logo />
            <Controls />
            <PlanetInfo data={planetData} />
            <NasaAttribution />
        </div>
        </div>
    );
    }