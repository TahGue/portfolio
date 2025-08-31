import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Portfolio'
  const subtitle = searchParams.get('subtitle') || 'Next.js • Tailwind • Prisma'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '64px',
          background: 'linear-gradient(135deg, #0b1220 0%, #1b0f2b 100%)',
          color: 'white',
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Helvetica, Apple Color Emoji, Segoe UI Emoji'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(600px circle at 0% 0%, rgba(56,189,248,0.25), transparent 40%), radial-gradient(800px circle at 100% 100%, rgba(168,85,247,0.25), transparent 40%)'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ marginTop: 12, fontSize: 28, opacity: 0.9 }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
