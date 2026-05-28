import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join SkillSync free. Build AI-powered roadmaps, get resume insights, and connect with top recruiters.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white font-mono">
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl"
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center border border-zinc-800 bg-zinc-950">
            <Image
              width={64}
              height={64}
              src="/logo.png"
              alt="SkillSync"
              className="h-6 w-6 object-contain"
            />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">
            SkillSync
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex h-9 items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back home
        </Link>
      </header>

      {/* Centered card */}
      <section className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              [ 01 ] create account
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Join SkillSync
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Start building an AI-powered career today.
            </p>
          </div>

          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/onboarding"
          />
        </div>
      </section>
    </main>
  );
}
