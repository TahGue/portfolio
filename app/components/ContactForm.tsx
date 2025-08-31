"use client"

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to submit')
      setStatus({ ok: true, msg: 'Thanks! I will get back to you shortly.' })
      setName(''); setEmail(''); setMessage('')
    } catch (err: any) {
      setStatus({ ok: false, msg: err?.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1" htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30"
          placeholder="Your name"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full min-h-32 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30"
          placeholder="How can I help?"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm h-10 px-5 disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send message'}
      </button>

      {status && (
        <p className={`text-sm ${status.ok ? 'text-green-600' : 'text-red-600'}`}>
          {status.msg}
        </p>
      )}
    </form>
  )
}
