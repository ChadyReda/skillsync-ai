"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-25"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(239,68,68,0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-6 text-center">
        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/[0.07]">
          <TriangleAlert className="h-7 w-7 text-rose-400" />
        </div>

        {/* Code */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">
          [ error / unexpected ]
        </p>

        {/* Headline */}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          An unexpected error occurred. This has been noted. You can try
          refreshing the page or return home while we look into it.
        </p>

        {/* Error digest */}
        {error.digest && (
          <p className="mt-4 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            Error ID: {error.digest}
          </p>
        )}

        {/* Divider */}
        <div className="my-8 h-px w-full bg-zinc-800/60" />

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white bg-white px-6 font-mono text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>

        {/* Report link */}
        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-700">
          Happens repeatedly?{" "}
          <Link href="/report" className="text-zinc-500 transition-colors hover:text-zinc-300">
            Report an issue
          </Link>
        </p>
      </div>
    </main>
  );
}
