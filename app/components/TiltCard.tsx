"use client"

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'

type Props = {
  className?: string
  children: React.ReactNode
}

export default function TiltCard({ className = '', children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useTransform(y, [0, 1], [8, -8])
  const rotateY = useTransform(x, [0, 1], [-8, 8])

  function onMouseMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width // 0..1
    const py = (e.clientY - rect.top) / rect.height // 0..1
    x.set(px)
    y.set(py)
  }

  function onMouseLeave() {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={"[perspective:1000px] will-change-transform " + className}
    >
      {children}
    </motion.div>
  )
}
