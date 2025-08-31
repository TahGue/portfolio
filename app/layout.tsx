import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "./components/ScrollProgress";
import SpotlightCursor from "./components/SpotlightCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Portfolio",
    template: "%s | Portfolio",
  },
  description: "Interactive portfolio built with Next.js, Tailwind, animations, and Prisma.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Portfolio",
    description: "Interactive portfolio built with Next.js, Tailwind, animations, and Prisma.",
    images: [
      { url: "/api/og?title=Portfolio", width: 1200, height: 630, alt: "Portfolio" }
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollProgress />
        <SpotlightCursor />
        <header className="sticky top-0 z-10 backdrop-blur bg-background/70 border-b border-black/5 dark:border-white/10">
          <nav className="mx-auto max-w-6xl w-full px-4 py-3 flex items-center gap-5 text-sm">
            <a href="#home" className="hover:underline underline-offset-4">Home</a>
            <a href="#projects" className="hover:underline underline-offset-4">Projects</a>
            <a href="#skills" className="hover:underline underline-offset-4">Skills</a>
            <a href="#about" className="hover:underline underline-offset-4">About</a>
            <a href="#contact" className="hover:underline underline-offset-4 ml-auto">Contact</a>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl w-full px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
