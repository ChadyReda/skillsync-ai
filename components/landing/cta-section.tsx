"use client";

import Link from "next/link";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const { isSignedIn } = useUser();

  return (
    <section
      id="cta"
      className="border-b border-zinc-800 bg-zinc-950 px-4 py-24 sm:px-6 sm:py-32"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          [ 06 ] get started
        </p>

        <h2 className="mt-4 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Your next role
          <br />
          <span className="text-zinc-500">is closer than you think.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-md text-zinc-500">
          Join 800+ career builders who stopped applying in the dark and started
          landing interviews on purpose.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="group inline-flex h-12 items-center gap-2 bg-white px-10 font-mono text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
            >
              Workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/onboarding"
              signInForceRedirectUrl="/dashboard"
            >
              <button className="group inline-flex h-12 items-center gap-2 bg-white px-10 font-mono text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SignUpButton>
          )}
        </div>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-700">
          No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}
