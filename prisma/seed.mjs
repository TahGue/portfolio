import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.contactSubmission.deleteMany()
  await prisma.project.deleteMany()
  await prisma.skill.deleteMany()

  // Skills
  await prisma.skill.createMany({
    data: [
      { name: 'Next.js', proficiency: 90 },
      { name: 'TypeScript', proficiency: 88 },
      { name: 'Tailwind CSS', proficiency: 85 },
      { name: 'Three.js', proficiency: 70 },
      { name: 'Prisma', proficiency: 82 }
    ]
  })

  // Projects
  await prisma.project.createMany({
    data: [
      {
        title: 'Interactive Portfolio',
        description: 'Next.js + Tailwind with animated aurora background and Prisma backend.',
        imageUrl: '/next.svg',
        techStack: ['Next.js', 'Tailwind', 'Prisma'],
        link: null
      },
      {
        title: '3D Hero Concept',
        description: 'R3F particles/constellation demo with reduced-motion fallback.',
        imageUrl: '/globe.svg',
        techStack: ['React Three Fiber', 'drei'],
        link: null
      }
    ]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
