"use client"

import { useEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  /** slide-up | slide-left | slide-right */
  variant?: 'slide-up' | 'slide-left' | 'slide-right'
}

export default function RevealOnScroll({ children, className = '', variant = 'slide-up' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      node.classList.add('visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${variant} ${className}`}>
      {children}
    </div>
  )
}
