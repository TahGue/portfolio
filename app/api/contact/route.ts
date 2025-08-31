import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Very basic email check (avoid extra deps)
    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    await prisma.contactSubmission.create({
      data: { name, email, message }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/contact error', err)
    return NextResponse.json({ error: 'Failed to submit contact' }, { status: 500 })
  }
}
