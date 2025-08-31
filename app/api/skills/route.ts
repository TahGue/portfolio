import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { proficiency: 'desc' } })
    return NextResponse.json(skills)
  } catch (err) {
    console.error('GET /api/skills error', err)
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
  }
}
