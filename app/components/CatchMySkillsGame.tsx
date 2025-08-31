"use client"

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  skills: string[]
  className?: string
}

type GameState = {
  isPlaying: boolean
  isPaused: boolean
  score: number
  lives: number
  timeLeft: number
  player: { x: number; y: number; w: number; h: number }
  items: Item[]
  keys: Record<string, boolean>
  lastSpawn: number
  difficulty: number // increases over time
  combo: number
  comboTimer: number
}

type Item = {
  x: number
  y: number
  w: number
  h: number
  vy: number
  type: 'skill' | 'bug' | 'power'
  text?: string
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  life: number
  color: string
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export default function CatchMySkillsGame({ skills, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [playing, setPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const [highScore, setHighScore] = useState(0)
  const [muted, setMuted] = useState(false)
  const [preset, setPreset] = useState<'easy' | 'normal' | 'hard'>('normal')

  // touch state
  const touchRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 })

  const stateRef = useRef<GameState | null>(null)
  const timers = useRef<{ interval?: any; raf?: number }>({})
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // load persisted settings
    try {
      const hs = typeof window !== 'undefined' ? Number(localStorage.getItem('cmg_high_score') || 0) : 0
      if (!Number.isNaN(hs)) setHighScore(hs)
      const m = localStorage.getItem('cmg_muted')
      if (m) setMuted(m === '1')
    } catch {}

    const c = canvasRef.current
    if (!c) return

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const resize = () => {
      const parent = c.parentElement
      if (!parent) return
      const w = Math.min(600, parent.clientWidth)
      const h = Math.round(w * 0.75) // 4:3
      c.width = Math.floor(w * dpr)
      c.height = Math.floor(h * dpr)
      c.style.width = w + 'px'
      c.style.height = h + 'px'
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c.parentElement || c)
    return () => ro.disconnect()
  }, [mounted])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current && (stateRef.current.keys[e.key.toLowerCase()] = true)
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault()
        togglePause()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current && (stateRef.current.keys[e.key.toLowerCase()] = false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const startGame = () => {
    const c = canvasRef.current
    if (!c) return

    const baseW = c.width
    const baseH = c.height
    const playerSize = Math.floor(Math.min(baseW, baseH) * 0.08)

    const init: GameState = {
      isPlaying: true,
      isPaused: false,
      score: 0,
      lives: 3,
      timeLeft: 60,
      player: { x: (baseW - playerSize) / 2, y: baseH - playerSize - 10, w: playerSize, h: playerSize },
      items: [],
      keys: {},
      lastSpawn: 0,
      difficulty: preset === 'easy' ? 0.6 : preset === 'hard' ? 1.4 : 1,
      combo: 1,
      comboTimer: 0,
    }
    stateRef.current = init
    setScore(0)
    setLives(3)
    setTimeLeft(60)
    setPlaying(true)
    setMessage('')

    // timer
    if (timers.current.interval) clearInterval(timers.current.interval)
    timers.current.interval = setInterval(() => {
      const s = stateRef.current
      if (!s) return
      if (!s.isPaused) s.timeLeft -= 1
      setTimeLeft(s.timeLeft)
      if (!s.isPaused) s.difficulty += 0.03 // increase gradually
      // decay combo timer
      if (s.comboTimer > 0) s.comboTimer -= 1
      if (s.comboTimer <= 0) s.combo = 1
      if (s.timeLeft <= 0 || s.lives <= 0) {
        endGame()
      }
    }, 1000)

    // loop
    const loop = (t: number) => {
      if (!stateRef.current?.isPlaying) return
      if (stateRef.current.isPaused) {
        timers.current.raf = requestAnimationFrame(loop)
        return
      }
      update(t)
      draw()
      timers.current.raf = requestAnimationFrame(loop)
    }
    timers.current.raf = requestAnimationFrame(loop)
  }

  const togglePause = () => {
    const s = stateRef.current
    if (!s || !s.isPlaying) return
    s.isPaused = !s.isPaused
  }

  const endGame = () => {
    const s = stateRef.current
    if (!s) return
    s.isPlaying = false
    setPlaying(false)
    if (timers.current.interval) clearInterval(timers.current.interval)
    if (timers.current.raf) cancelAnimationFrame(timers.current.raf)

    const final = s.score
    // persist high score
    if (final > highScore) {
      setHighScore(final)
      try { localStorage.setItem('cmg_high_score', String(final)) } catch {}
    }
    if (final >= 250) setMessage("🌟 Amazing! You'd make a great addition to any development team!")
    else if (final >= 150) setMessage('🎯 Great job! Ready to explore the projects below!')
    else if (final >= 80) setMessage('👍 Nice run! Check out more of my work below.')
    else setMessage('🎮 Thanks for playing! Scroll to see real projects.')
  }

  const spawnItem = (now: number) => {
    const s = stateRef.current!
    const c = canvasRef.current!
    const spawnEvery = Math.max(250, 900 - s.difficulty * 140) // faster with difficulty
    if (now - s.lastSpawn < spawnEvery) return
    s.lastSpawn = now

    // type weights: more skills than bugs; occasional power-ups
    const r = Math.random()
    let type: Item['type'] = 'skill'
    if (r < 0.15) type = 'bug'
    else if (r > 0.9) type = 'power'

    const w = Math.max(44, 90 - s.difficulty * 10)
    const h = 28
    const dpr = 1
    const x = Math.random() * (c.width - w)
    const y = -h
    const vy = 2 + Math.random() * 2 + s.difficulty
    const text = type === 'skill' ? skills[Math.floor(Math.random() * skills.length)] : type === 'bug' ? 'Bug' : 'Power'

    s.items.push({ x, y, w, h, vy, type, text })
  }

  const update = (now: number) => {
    const s = stateRef.current!
    const c = canvasRef.current!
    // spawn
    spawnItem(now)

    // movement
    const speed = 6
    const left = s.keys['arrowleft'] || s.keys['a']
    const right = s.keys['arrowright'] || s.keys['d']
    const up = s.keys['arrowup'] || s.keys['w']
    const down = s.keys['arrowdown'] || s.keys['s']

    // touch drag moves to touch position smoothly
    if (touchRef.current.active) {
      const tx = touchRef.current.x * (c.width / c.clientWidth)
      const ty = touchRef.current.y * (c.height / c.clientHeight)
      s.player.x += (tx - (s.player.x + s.player.w / 2)) * 0.2
      s.player.y += (ty - (s.player.y + s.player.h / 2)) * 0.2
    } else {
      if (left) s.player.x -= speed
      if (right) s.player.x += speed
      if (up) s.player.y -= speed
      if (down) s.player.y += speed
    }

    s.player.x = clamp(s.player.x, 0, c.width - s.player.w)
    s.player.y = clamp(s.player.y, 0, c.height - s.player.h)

    // update items
    for (let i = s.items.length - 1; i >= 0; i--) {
      const it = s.items[i]
      it.y += it.vy

      // collision
      if (
        it.x < s.player.x + s.player.w &&
        it.x + it.w > s.player.x &&
        it.y < s.player.y + s.player.h &&
        it.y + it.h > s.player.y
      ) {
        if (it.type === 'skill') {
          // scoring with combo
          s.combo = Math.min(5, s.combo + 1)
          s.comboTimer = 3 // seconds window maintained in timer interval
          s.score += 10 * s.combo
          setScore(s.score)
          spawnParticles(it.x + it.w / 2, it.y + it.h / 2, '#22c55e')
          beep(880)
        } else if (it.type === 'bug') {
          s.lives -= 1
          setLives(s.lives)
          s.combo = 1
          s.comboTimer = 0
          spawnParticles(it.x + it.w / 2, it.y + it.h / 2, '#ef4444')
          beep(220)
        } else if (it.type === 'power') {
          // power-up: +1 life or slow motion briefly
          if (Math.random() < 0.5) {
            s.lives = Math.min(5, s.lives + 1)
            setLives(s.lives)
            spawnParticles(it.x + it.w / 2, it.y + it.h / 2, '#f59e0b')
            beep(1320)
          } else {
            s.difficulty = Math.max(1, s.difficulty - 0.8)
            spawnParticles(it.x + it.w / 2, it.y + it.h / 2, '#f59e0b')
            beep(1320)
          }
        }
        s.items.splice(i, 1)
        continue
      }

      if (it.y > c.height + 40) s.items.splice(i, 1)
    }
  }

  // simple particle system
  const particlesRef = useRef<Particle[]>([])
  const spawnParticles = (x: number, y: number, color: string) => {
    const arr = particlesRef.current
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = 2 + Math.random() * 2
      arr.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, alpha: 1, life: 30, color })
    }
  }

  const draw = () => {
    const s = stateRef.current!
    const c = canvasRef.current!
    const ctx = c.getContext('2d')!

    // background
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, c.width, c.height)

    // player
    ctx.fillStyle = '#22c55e'
    ctx.fillRect(s.player.x, s.player.y, s.player.w, s.player.h)
    // face
    ctx.fillStyle = '#fff'
    ctx.fillRect(s.player.x + s.player.w * 0.2, s.player.y + s.player.h * 0.2, 8, 8)
    ctx.fillRect(s.player.x + s.player.w * 0.6, s.player.y + s.player.h * 0.2, 8, 8)
    ctx.fillRect(s.player.x + s.player.w * 0.3, s.player.y + s.player.h * 0.7, s.player.w * 0.4, 5)

    // items
    for (const it of s.items) {
      if (it.type === 'skill') ctx.fillStyle = '#22c55e'
      else if (it.type === 'bug') ctx.fillStyle = '#ef4444'
      else ctx.fillStyle = '#f59e0b'
      ctx.fillRect(it.x, it.y, it.w, it.h)

      // text label
      if (it.text) {
        ctx.fillStyle = '#fff'
        ctx.font = '14px system-ui, -apple-system, Segoe UI, Roboto'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(it.text, it.x + it.w / 2, it.y + it.h / 2)
      }
    }

    // particles
    const arr = particlesRef.current
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.98
      p.vy *= 0.98
      p.alpha -= 1 / p.life
      if (p.alpha <= 0) { arr.splice(i, 1); continue }
      ctx.globalAlpha = Math.max(0, p.alpha)
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      ctx.globalAlpha = 1
    }
  }

  // tiny audio beeps
  const ensureAudio = () => {
    if (muted) return null
    if (!audioRef.current) {
      try { audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)() } catch {}
    }
    return audioRef.current
  }
  const beep = (freq: number) => {
    const ctx = ensureAudio()
    if (!ctx) return
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = freq
    g.gain.value = 0.04
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(() => { o.stop(); o.disconnect(); g.disconnect() }, 120)
  }

  // touch handlers
  const onTouchStart: React.TouchEventHandler<HTMLCanvasElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    touchRef.current.active = true
    touchRef.current.x = e.touches[0].clientX - rect.left
    touchRef.current.y = e.touches[0].clientY - rect.top
  }
  const onTouchMove: React.TouchEventHandler<HTMLCanvasElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    touchRef.current.x = e.touches[0].clientX - rect.left
    touchRef.current.y = e.touches[0].clientY - rect.top
  }
  const onTouchEnd: React.TouchEventHandler<HTMLCanvasElement> = () => {
    touchRef.current.active = false
  }

  useEffect(() => {
    return () => {
      if (timers.current.interval) clearInterval(timers.current.interval)
      if (timers.current.raf) cancelAnimationFrame(timers.current.raf)
    }
  }, [])

  return (
    <div className={className}>
      <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-background/60 backdrop-blur shadow-sm">
        <h3 className="text-2xl font-semibold text-center">🎮 Catch My Skills</h3>
        <p className="text-center text-sm text-foreground/80">Catch skills, avoid bugs, grab power-ups. 60s challenge.</p>
        <div className="flex items-center justify-between text-sm font-medium mt-3">
          <span>Score: {score}</span>
          <span>Lives: {lives}</span>
          <span>Time: {timeLeft}s</span>
        </div>
        <div className="flex items-center justify-between text-xs text-foreground/70 mt-1">
          <span>High score: {highScore}</span>
          <span>Press P to {stateRef.current?.isPaused ? 'resume' : 'pause'}</span>
        </div>
        <div className="mt-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-lg border border-black/10 dark:border-white/15 bg-black/20 touch-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <select
            className="px-3 py-2 text-xs rounded-full border border-black/10 dark:border-white/15 bg-background"
            disabled={playing}
            value={preset}
            onChange={(e) => setPreset(e.target.value as any)}
            aria-label="Difficulty preset"
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
          <button
            onClick={playing ? undefined : startGame}
            disabled={playing}
            className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {playing ? 'Playing…' : 'Start'}
          </button>
          <button
            onClick={togglePause}
            disabled={!playing}
            className="rounded-full border border-black/10 dark:border-white/15 px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            {stateRef.current?.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => { setPlaying(false); endGame() }}
            disabled={!playing}
            className="rounded-full border border-black/10 dark:border-white/15 px-5 py-2 text-sm font-medium disabled:opacity-50"
          >
            End
          </button>
          <button
            onClick={() => { setMuted((m) => { try { localStorage.setItem('cmg_muted', m ? '0' : '1') } catch {}; return !m }) }}
            className="rounded-full border border-black/10 dark:border-white/15 px-5 py-2 text-sm font-medium"
            aria-pressed={muted}
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>
        {!playing && message && (
          <div className="mt-4 text-center text-sm">
            <div className="font-medium">Game Over</div>
            <div>{message}</div>
          </div>
        )}
        <div className="mt-3 text-xs text-foreground/70">
          <strong>How to play:</strong> WASD/Arrow keys or drag on touch. Catch green skills (+10 × combo). Avoid red bugs (-1 life). Power-ups (orange) give +1 life or slow-down. Press P to pause.
        </div>
      </div>
    </div>
  )
}
