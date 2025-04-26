import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import SolarSystem from './SolarSystem'
import { useStore } from '../../store'
import LoadingScreen from '../LoadingScreen'

const Scene = () => {
  const [started, setStarted] = useState(false)
  const initializeAudio = useStore(state => state.initializeAudio)

  const handleSceneLoaded = () => {
    setStarted(true)
    initializeAudio()
  }

  return (
    <div className="fixed inset-0">
      <LoadingScreen started={started} />
      <Canvas
        shadows
        className="w-full h-full"
        camera={{
          position: [0, 30, 80],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
      >
        <Suspense fallback={null}>
          <SolarSystem onLoaded={handleSceneLoaded} />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Scene
