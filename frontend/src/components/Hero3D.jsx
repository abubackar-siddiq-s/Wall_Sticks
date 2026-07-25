import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'

// A single framed poster: black frame + textured canvas + subtle rim light
function FramedPoster({ position, rotation, textureUrl, scale = 1 }) {
  const texture = useTexture(textureUrl)
  const group = useRef()

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = rotation[1] + Math.sin(t * 0.3 + position[0]) * 0.08
    group.current.position.y = position[1] + Math.sin(t * 0.5 + position[0] * 2) * 0.15
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={group} position={position} rotation={rotation} scale={scale}>
        {/* frame */}
        <mesh>
          <boxGeometry args={[1.65, 2.2, 0.06]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.35} metalness={0.4} />
        </mesh>
        {/* poster surface */}
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[1.45, 2.0]} />
          <meshStandardMaterial map={texture} roughness={0.6} metalness={0} />
        </mesh>
        {/* thin gold edge accent */}
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[1.52, 2.07]} />
          <meshStandardMaterial color="#FFD000" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
    </Float>
  )
}

function Particles({ count = 90 }) {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [count])

  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#FFD000" size={0.035} transparent opacity={0.55} sizeAttenuation />
    </points>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 6))

  useFrame(() => {
    target.current.x = pointer.x * 1.1
    target.current.y = pointer.y * 0.6 + 0.2
    camera.position.x += (target.current.x - camera.position.x) * 0.03
    camera.position.y += (target.current.y - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })
  return null
}

const seeds = ['hero1', 'hero2', 'hero3', 'hero4', 'hero5']

export default function Hero3D() {
  const posters = useMemo(() => ([
    { position: [-1.6, 0.3, -0.8], rotation: [0, 0.3, 0], scale: 1.0, seed: seeds[0] },
    { position: [-0.2, -0.6, 0.6], rotation: [0, 0.12, 0], scale: 1.25, seed: seeds[1] },
    { position: [1.4, 0.6, 0.3], rotation: [0, -0.18, 0], scale: 1.15, seed: seeds[2] },
    { position: [2.8, -0.3, -1.0], rotation: [0, -0.35, 0], scale: 0.95, seed: seeds[3] },
    { position: [0.6, 1.3, -1.8], rotation: [0, 0.05, 0], scale: 0.85, seed: seeds[4] },
  ]), [])

  return (
    <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[58%] pointer-events-none">
      <Canvas
        camera={{ position: [0.4, 0.2, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} color="#FFD000" />
        <directionalLight position={[-5, -2, 3]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}>
          {posters.map((p, i) => (
            <FramedPoster
              key={i}
              position={p.position}
              rotation={p.rotation}
              scale={p.scale}
              textureUrl={`https://picsum.photos/seed/${p.seed}/600/800`}
            />
          ))}
          <Particles />
          <Environment preset="city" />
        </Suspense>
        <Rig />
      </Canvas>
    </div>
  )
}
