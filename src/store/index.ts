import { create } from 'zustand';
import { Howl } from 'howler';
import { Vector3 } from 'three';

interface StoreState {
  selectedBody: string | null;
  audioEnabled: boolean;
  autoTourActive: boolean;
  showOrbitPaths: boolean;
  ambientSound: Howl | null;
  currentPlanetPositions: { [key: string]: Vector3 };
  setSelectedBody: (id: string | null) => void;
  toggleAudio: () => void;
  toggleAutoTour: () => void;
  toggleOrbitPaths: () => void;
  initializeAudio: () => void;
  updatePlanetPosition: (id: string, position: Vector3) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  selectedBody: null,
  audioEnabled: true,
  autoTourActive: false,
  showOrbitPaths: true,
  ambientSound: null,
  currentPlanetPositions: {},
  
  setSelectedBody: (id) => set({ selectedBody: id }),
  
  toggleAudio: () => {
    const { audioEnabled, ambientSound } = get();
    
    if (ambientSound) {
      if (audioEnabled) {
        ambientSound.pause();
      } else {
        ambientSound.play();
      }
    }
    
    set({ audioEnabled: !audioEnabled });
  },
  
  toggleAutoTour: () => set((state) => ({ autoTourActive: !state.autoTourActive })),
  
  toggleOrbitPaths: () => set((state) => ({ showOrbitPaths: !state.showOrbitPaths })),
  
  updatePlanetPosition: (id, position) => set((state) => ({
    currentPlanetPositions: {
      ...state.currentPlanetPositions,
      [id]: position
    }
  })),
  
  initializeAudio: () => {
    const { ambientSound, audioEnabled } = get();
    
    if (!ambientSound) {
      const sound = new Howl({
        src: ['/intersstler.mp3'],
        loop: true,
        volume: 0.2,
        autoplay: false,
      });
      
      set({ ambientSound: sound });
      
      if (audioEnabled) {
        sound.play();
      }
    }
  }
}));