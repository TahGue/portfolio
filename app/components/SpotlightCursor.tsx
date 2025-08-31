"use client"

import { useEffect, useState } from 'react'

export default function SpotlightCursor() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 })

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const size = 240
  const style: React.CSSProperties = {
    background: `radial-gradient(${size}px ${size}px at ${pos.x}px ${pos.y}px, rgba(56,189,248,0.15), rgba(168,85,247,0.1) 40%, transparent 70%)`
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-200"
      style={style}
    />
  )
}
