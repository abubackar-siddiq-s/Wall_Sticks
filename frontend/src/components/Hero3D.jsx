import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, Environment, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useTrendingProducts, useProducts } from '../hooks/useProducts'
import { imgSrc } from '../lib/imageUrl'

// A single framed poster: black frame + textured canvas + subtle rim light
function FramedPoster({ position, rotation, textureUrl, scale = 1, defaultSvg }) {
  const texture = useTexture(textureUrl || defaultSvg)
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


function Particles() {
  const count = 35
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 10
      arr[i + 1] = (Math.random() - 0.5) * 8
      arr[i + 2] = (Math.random() - 0.5) * 6
    }
    return arr
  }, [])

  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#FFD000" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.4 + pointer.x * 0.4, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + pointer.y * 0.3, 0.05)
    camera.lookAt(0, 0, 0)
  })
  return null
}

const posterLayouts = [
  { position: [-1.6, 0.3, -0.8], rotation: [0, 0.3, 0], scale: 1.0 },
  { position: [-0.2, -0.6, 0.6], rotation: [0, 0.12, 0], scale: 1.25 },
  { position: [1.4, 0.6, 0.3], rotation: [0, -0.18, 0], scale: 1.15 },
  { position: [2.8, -0.3, -1.0], rotation: [0, -0.35, 0], scale: 0.95 },
  { position: [0.6, 1.3, -1.8], rotation: [0, 0.05, 0], scale: 0.85 },
]

export default function Hero3D() {
  const { products: trendingProducts } = useTrendingProducts()
  const { products: allCatalogProducts } = useProducts()

  const defaultSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="%23111111"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23FFD000" font-family="sans-serif" font-size="42" font-weight="bold">WALLSTICKS</text></svg>'

  const imageList = useMemo(() => {
    const combined = [...(trendingProducts || []), ...(allCatalogProducts || [])]
    const list = []
    combined.forEach((p) => {
      const mainImg = p.images?.[0]
      if (mainImg) {
        const url = imgSrc(mainImg)
        if (url && !list.includes(url)) {
          list.push(url)
        }
      }
    })
    return list
  }, [trendingProducts, allCatalogProducts])

  return (
    <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[58%] pointer-events-none">
      <Canvas
        camera={{ position: [0.4, 0.2, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <hemisphereLight intensity={0.5} groundColor="#111111" color="#ffffff" />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#FFD000" />
        <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#ffffff" />
        <Suspense fallback={null}>
          {posterLayouts.map((p, i) => {
            const textureUrl = imageList.length > 0 ? imageList[i % imageList.length] : defaultSvg
            return (
              <FramedPoster
                key={i}
                position={p.position}
                rotation={p.rotation}
                scale={p.scale}
                textureUrl={textureUrl}
                defaultSvg={defaultSvg}
              />
            )
          })}
          <Particles />
        </Suspense>
        <Rig />
      </Canvas>
    </div>
  )
}
