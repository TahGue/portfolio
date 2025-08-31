"use client"

import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

type NetworkProps = {
  count?: number
  radius?: number
  linkDistance?: number
  colorA?: string
  colorB?: string
}

function NeuralNetwork({
  count = 220,
  radius = 5.5,
  linkDistance = 1.2,
  colorA = '#22d3ee',
  colorB = '#a855f7',
}: NetworkProps) {
  const prefersReduced = useReducedMotion()

  // Generate nodes in a sphere
  const nodes = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const rand = THREE.MathUtils.randFloatSpread
    for (let i = 0; i < count; i++) {
      const v = new THREE.Vector3(rand(radius), rand(radius), rand(radius))
      if (v.length() > radius) v.setLength(Math.random() * radius)
      pts.push(v)
    }
    return pts
  }, [count, radius])

  // Build geometry for points
  const pointsGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const positions = new Float32Array(nodes.length * 3)
    nodes.forEach((v, i) => {
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
    })
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geom
  }, [nodes])

  // Build line segments for close-by nodes
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null)
  const linePositions = useMemo(() => new Float32Array(nodes.length * nodes.length * 6), [nodes.length])
  const lineColors = useMemo(() => new Float32Array(nodes.length * nodes.length * 6), [nodes.length])

  // Precompute pairs within threshold
  const pairs = useMemo(() => {
    const arr: Array<[number, number, number]> = [] // [i,j,d]
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].distanceTo(nodes[j])
        if (d < linkDistance) arr.push([i, j, d])
      }
    }
    return arr
  }, [nodes, linkDistance])

  // Animate subtle breathing + rotation
  const tRef = useRef(0)
  useFrame((state, delta) => {
    tRef.current += delta
    const positions = pointsGeometry.getAttribute('position') as THREE.BufferAttribute

    // subtle orbit/breath only if not reduced motion
    if (!prefersReduced) {
      for (let i = 0; i < nodes.length; i++) {
        const base = nodes[i]
        const ox = Math.sin(tRef.current * 0.4 + i) * 0.02
        const oy = Math.cos(tRef.current * 0.35 + i * 1.3) * 0.02
        const oz = Math.sin(tRef.current * 0.3 + i * 0.7) * 0.02
        positions.setXYZ(i, base.x + ox, base.y + oy, base.z + oz)
      }
      positions.needsUpdate = true
    }

    // Rotate the entire group slowly
    const g = groupRef.current
    if (g && !prefersReduced) {
      g.rotation.y += delta * 0.03
      g.rotation.x += delta * 0.005
    }

    // Update lines
    const posArr = positions.array as Float32Array
    let ptr = 0
    let cptr = 0
    const colA = new THREE.Color(colorA)
    const colB = new THREE.Color(colorB)
    const tmpA = new THREE.Vector3()
    const tmpB = new THREE.Vector3()
    for (let k = 0; k < pairs.length; k++) {
      const [i, j] = pairs[k]
      tmpA.set(posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2])
      tmpB.set(posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2])
      linePositions[ptr++] = tmpA.x
      linePositions[ptr++] = tmpA.y
      linePositions[ptr++] = tmpA.z
      linePositions[ptr++] = tmpB.x
      linePositions[ptr++] = tmpB.y
      linePositions[ptr++] = tmpB.z

      // gradient color per segment
      const t = (k / pairs.length)
      const c1 = colA.clone().lerp(colB, t)
      const c2 = colA.clone().lerp(colB, Math.min(1, t + 0.1))
      lineColors[cptr++] = c1.r; lineColors[cptr++] = c1.g; lineColors[cptr++] = c1.b
      lineColors[cptr++] = c2.r; lineColors[cptr++] = c2.g; lineColors[cptr++] = c2.b
    }

    if (linesGeometryRef.current) {
      linesGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
      linesGeometryRef.current.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
      linesGeometryRef.current.computeBoundingSphere()
      linesGeometryRef.current.attributes.position.needsUpdate = true
      linesGeometryRef.current.attributes.color.needsUpdate = true
    }
  })

  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef}>
      {/* Points as small glowing nodes */}
      <points geometry={pointsGeometry}>
        <pointsMaterial size={0.04} sizeAttenuation color={colorA} transparent opacity={0.65} />
      </points>

      {/* Lines connecting nearby nodes */}
      <lineSegments geometry={linesGeometryRef.current ?? new THREE.BufferGeometry()}>
        <lineBasicMaterial vertexColors transparent opacity={0.25} />
      </lineSegments>
    </group>
  )
}

export default function ThreeScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <Suspense fallback={null}>
          <NeuralNetwork />
        </Suspense>
      </Canvas>
    </div>
  )
}
