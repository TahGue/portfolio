# Portfolio (Next.js 15, Tailwind, Prisma, R3F)

One‑page, AI‑themed portfolio with animated “neural network” background, reveal‑on‑scroll animations, Prisma‑backed data, and accessible, responsive UI.

• Framework: Next.js App Router (15)
• Styling: Tailwind CSS v4
• Data: Prisma + SQLite
• 3D/Motion: React Three Fiber + three, Framer Motion

## Features
• Single‑page layout with anchored sections: `#home`, `#projects`, `#skills`, `#about`, `#contact`.
• AI “Neural Network” 3D background (`app/components/ThreeScene.tsx`) that respects reduced motion.
• Reveal‑on‑scroll animations (`RevealOnScroll`), interactive tilt cards (`TiltCard`).
• Contact form with API route (`app/api/contact/route.ts`).
• Prisma models: `Project`, `Skill`, `ContactSubmission`.
• Sitemap/robots tuned for single‑page.

## Getting Started
1) Install deps
```bash
npm install
```

2) Environment
Create `portfolio/.env` with SQLite URL (already included if using the dev DB):
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

3) Prisma (uses JSON field for `Project.techStack`)
```bash
npm run prisma:generate
npm run prisma:push
npm run db:seed   # optional demo data
```

4) Dev server
```bash
npm run dev
```
Open http://localhost:3000

## Scripts
• `dev` – start Next.js (Turbopack)
• `build` – build
• `start` – run production build
• `lint` – eslint
• `prisma:generate` – generate Prisma client
• `prisma:push` – push schema to SQLite
• `db:seed` – seed demo content

## Data Model (excerpt)
`prisma/schema.prisma` (SQLite)
```prisma
model Project {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  imageUrl    String?
  techStack   Json     // array of strings stored as JSON
  link        String?
  createdAt   DateTime @default(now())
}

model Skill {
  id           Int     @id @default(autoincrement())
  name         String
  proficiency  Int
  iconUrl      String?
}
```

## Customization
• Tweak AI background density/colors: `NeuralNetwork` props in `ThreeScene.tsx` (`count`, `radius`, `linkDistance`, `colorA`, `colorB`).
• Update content in `app/page.tsx` (hero, projects/skills rendering).
• Adjust animations in `RevealOnScroll.tsx` and Tailwind classes in `app/globals.css`.

## Deploy
Any Next.js 15 compatible host (e.g., Vercel). Ensure Prisma is generated at build time and the SQLite file is deployed (or switch provider).

## Accessibility and Performance
• Respects `prefers-reduced-motion`.
• Semantic HTML and keyboard‑friendly interactions.
