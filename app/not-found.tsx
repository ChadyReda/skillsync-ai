import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-25"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.12), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-6 text-center">
        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60">
          <Compass className="h-7 w-7 text-zinc-400" />
        </div>

        {/* Code */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          [ error / 404 ]
        </p>

        {/* Headline */}
        <h1 className="mt-3 text-6xl font-bold tracking-tight text-white sm:text-7xl">
          404
        </h1>
        <p className="mt-3 text-lg font-semibold text-zinc-300">
          Page not found
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
          Double-check the URL or head back home.
        </p>

        {/* Divider */}
        <div className="my-8 h-px w-full bg-zinc-800/60" />

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white bg-white px-6 font-mono text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
          >
            Go to dashboard
          </Link>
        </div>

        {/* Report link */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-700">
          Something broken?{" "}
          <Link href="/report" className="text-zinc-500 transition-colors hover:text-zinc-300">
            Report an issue
          </Link>
        </p>
      </div>
    </main>
  );
}
