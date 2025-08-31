"use client"

import { useEffect, useState } from 'react'

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      const scrolled = total > 0 ? (window.scrollY / total) * 100 : 0
      setProgress(Math.max(0, Math.min(100, scrolled)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-20 h-[3px] bg-transparent">
      <div
        className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
