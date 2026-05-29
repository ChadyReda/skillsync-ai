import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import { BetaBanner } from "@/components/beta/beta-banner";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://skillsync-ai.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SkillSync — AI Career Platform",
    template: "%s | SkillSync",
  },
  description:
    "Connect with top recruiters, build AI-personalized roadmaps, get resume insights, and land your dream role — all in one platform.",
  keywords: [
    "AI career platform",
    "job search",
    "AI resume",
    "career roadmap",
    "recruiter platform",
    "talent discovery",
    "career AI",
    "resume builder",
    "job application",
    "skill assessment",
    "career growth",
    "AI job matching",
    "professional network",
    "internship finder",
    "CV analysis",
    "career coaching AI",
  ],
  authors: [{ name: "SkillSync" }],
  creator: "SkillSync",
  publisher: "SkillSync",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SkillSync",
    title: "SkillSync — AI Career Platform",
    description:
      "Connect with top recruiters, build AI-personalized roadmaps, get resume insights, and land your dream role.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SkillSync — AI Career Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSync — AI Career Platform",
    description:
      "Connect with top recruiters, build AI-personalized roadmaps, get resume insights, and land your dream role.",
    images: ["/opengraph-image"],
    creator: "@skillsync_ai",
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SkillSync",
    description:
      "AI-powered career platform connecting candidates and recruiters through intelligent tools.",
    url: BASE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "SkillSync",
      url: BASE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SkillSync",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: ["https://twitter.com/skillsync_ai"],
    description:
      "SkillSync is an AI-powered career platform helping candidates find jobs and recruiters discover top talent.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${BASE_URL}/report`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is SkillSync?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SkillSync is an AI-powered career platform that connects candidates and recruiters. It offers AI-generated learning roadmaps, CV analysis, skill quizzes, real-time chat, and job matching tools.",
        },
      },
      {
        "@type": "Question",
        name: "Is SkillSync free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SkillSync is free to join. Candidates can create profiles, upload CVs, build AI roadmaps, and apply for jobs at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "How does SkillSync's AI career roadmap work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SkillSync's AI analyzes your CV, skills, and career goals to generate a personalized step-by-step learning roadmap with quizzes, milestones, and XP rewards.",
        },
      },
      {
        "@type": "Question",
        name: "Can recruiters use SkillSync to find candidates?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Recruiters can post jobs, search and filter candidates by skills and experience, build shortlists, and communicate with candidates directly through the platform.",
        },
      },
    ],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showDevNotice = process.env.NEXT_PUBLIC_SHOW_DEV_NOTICE === "true";

  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {jsonLd.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="h-full">
        <ClerkProvider appearance={clerkAppearance}>
          <Providers>
            {showDevNotice && <BetaBanner />}
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
