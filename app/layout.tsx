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
  process.env.NEXT_PUBLIC_APP_URL ?? "https://skillsync-ai.vercel.app";

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

const jsonLd = {
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
};

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
