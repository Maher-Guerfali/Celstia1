import { create } from 'zustand';
import { Howl } from 'howler';
import { Vector3 } from 'three';

interface StoreState {
  selectedBody: string | null;
  previouslySelectedBody: string | null;
  isInfoPanelVisible: boolean;
  audioEnabled: boolean;
  audioLoaded: boolean; // Add this property
  autoTourActive: boolean;
  showOrbitPaths: boolean;
  ambientSound: Howl | null;
  currentPlanetPositions: { [key: string]: Vector3 };
  setSelectedBody: (id: string | null) => void;
  toggleInfoPanel: () => void;
  toggleAudio: () => void;
  toggleAutoTour: () => void;
  toggleOrbitPaths: () => void;
  initializeAudio: () => void;
  updatePlanetPosition: (id: string, position: Vector3) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  selectedBody: null,
  previouslySelectedBody: null,
  isInfoPanelVisible: false,
  audioEnabled: true,
  audioLoaded: false, // Add initial value
  autoTourActive: false,
  showOrbitPaths: true,
  ambientSound: null,
  currentPlanetPositions: {},
  
  setSelectedBody: (id) => set((state) => ({ 
    previouslySelectedBody: state.selectedBody,
    selectedBody: id,
    isInfoPanelVisible: id !== null // Show panel when selecting a body
  })),
  
  toggleInfoPanel: () => set((state) => ({ 
    isInfoPanelVisible: !state.isInfoPanelVisible,
    // Don't change selectedBody when closing panel
  })),

  initializeAudio: () => {
    const { ambientSound, audioLoaded } = get();
    
    if (!ambientSound && !audioLoaded) {
      // Initialize audio in the background
      setTimeout(() => {
        try {
          const sound = new Howl({
            src: ['/intersstler.mp3'],
            loop: true,
            volume: 0.2,
            preload: true,
            html5: true,
            autoplay: false,
            onload: () => {
              console.log('Audio loaded successfully');
              set({ 
                ambientSound: sound,
                audioLoaded: true,
                audioEnabled: true
              });

              // Single event listener for first interaction
              const startAudio = () => {
                if (!sound.playing()) {
                  sound.play();
                }
                document.removeEventListener('click', startAudio);
                document.removeEventListener('touchstart', startAudio);
              };

              document.addEventListener('click', startAudio, { once: true });
              document.addEventListener('touchstart', startAudio, { once: true });
            },
            onloaderror: (id, error) => {
              console.error('Audio loading error:', error);
              set({ audioLoaded: false });
            },
            onplayerror: (id, error) => {
              console.error('Audio play error:', error);
              set({ audioEnabled: false });
            }
          });

          // Store the sound instance immediately
          set({ ambientSound: sound });

        } catch (error) {
          console.error('Error initializing audio:', error);
          set({ audioLoaded: false });
        }
      }, 0); // Use setTimeout to run in the next tick
    }
  },

  toggleAudio: () => {
    const { audioEnabled, ambientSound } = get();
    
    if (ambientSound) {
      if (audioEnabled) {
        ambientSound.pause();
      } else if (!ambientSound.playing()) {
        ambientSound.play();
      }
      set({ audioEnabled: !audioEnabled });
    }
  },

  toggleAutoTour: () => set((state) => ({ autoTourActive: !state.autoTourActive })),

  toggleOrbitPaths: () => set((state) => ({
    showOrbitPaths: !state.showOrbitPaths
  })),

  updatePlanetPosition: (id, position) => set((state) => ({
    currentPlanetPositions: {
      ...state.currentPlanetPositions,
      [id]: position
    }
  }))
}));