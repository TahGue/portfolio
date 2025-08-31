import { prisma } from '@/lib/prisma'
import RevealOnScroll from './components/RevealOnScroll'
import ThreeScene from './components/ThreeScene'
import ContactForm from './components/ContactForm'
import TiltCard from './components/TiltCard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [projects, skills] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.skill.findMany({ orderBy: { proficiency: 'desc' } })
  ])

  type Project = (typeof projects)[number]
  type Skill = (typeof skills)[number]

  return (
    <div className="relative min-h-screen py-14 sm:py-18">
      {/* Background effects */}
      <div className="aurora" aria-hidden />
      <ThreeScene />

      {/* Hero */}
      <section id="home" className="mx-auto max-w-6xl w-full px-4">
        <RevealOnScroll>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs mb-3 bg-background/70 backdrop-blur">
            <span className="i-lucide-sparkles" aria-hidden /> New
            <span className="opacity-70">Now with 3D + motion</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-tight">
            Build delightful, performant
            <span className="block bg-clip-text text-transparent bg-[linear-gradient(90deg,#22d3ee,#a855f7)]">web experiences</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-foreground/80 max-w-2xl">
            Full‑stack Next.js with Tailwind, Prisma, and tasteful motion. Accessible, responsive, and production‑ready.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="#projects" className="rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium hover:opacity-90">
              View Projects
            </a>
            <a href="#contact" className="rounded-full border border-black/10 dark:border-white/15 px-5 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
              Contact Me
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-foreground/70">
            <span className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1">Next.js 15</span>
            <span className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1">Prisma</span>
            <span className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1">R3F</span>
            <span className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1">Framer Motion</span>
          </div>
        </RevealOnScroll>
      </section>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-6xl w-full px-4 mt-20">
        <RevealOnScroll className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold">Projects</h2>
        </RevealOnScroll>
        {projects.length === 0 ? (
          <p className="text-foreground/70">No projects yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {projects.map((p: Project) => (
              <RevealOnScroll key={p.id}>
                <TiltCard className="[transform-style:preserve-3d]">
                <li className="rounded-xl border border-black/10 dark:border-white/15 p-5 bg-background/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-medium">{p.title}</h3>
                  <p className="mt-2 text-foreground/80 text-sm leading-6">{p.description}</p>
                  {Array.isArray(p.techStack) && (p.techStack as unknown as string[])?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(p.techStack as unknown as string[]).map((t: string) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-black/5 dark:bg-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {p.link ? (
                    <a href={p.link} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm underline underline-offset-4">
                      Visit →
                    </a>
                  ) : null}
                </li>
                </TiltCard>
              </RevealOnScroll>
            ))}
          </ul>
        )}
      </section>

      {/* Skills */}
      <section id="skills" className="mx-auto max-w-6xl w-full px-4 mt-20">
        <RevealOnScroll className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold">Skills</h2>
        </RevealOnScroll>
        {skills.length === 0 ? (
          <p className="text-foreground/70">No skills yet.</p>
        ) : (
          <ul className="grid gap-4">
            {skills.map((s: Skill) => (
              <RevealOnScroll key={s.id}>
                <li className="rounded-lg border border-black/10 dark:border-white/15 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-foreground/70">{s.proficiency}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-foreground/70"
                      style={{ width: `${s.proficiency}%` }}
                    />
                  </div>
                </li>
              </RevealOnScroll>
            ))}
          </ul>
        )}
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-6xl w-full px-4 mt-20">
        <RevealOnScroll>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-3">About</h2>
          <p className="text-foreground/80 max-w-3xl">
            I’m building a modern, interactive portfolio with Next.js, Tailwind, and Prisma.
            This space will include a short bio, highlights of experience, and a timeline.
          </p>
        </RevealOnScroll>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl w-full px-4 mt-20 pb-20">
        <RevealOnScroll className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-semibold">Contact</h2>
        </RevealOnScroll>
        <div className="mx-auto max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
