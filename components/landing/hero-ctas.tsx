"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";

export function HeroCTAs() {
  const { t } = useTranslation();
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return (
      <div className="mb-16 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="group inline-flex h-12 w-full items-center justify-center gap-2 border border-white bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 sm:w-auto"
        >
          Go to Workspace
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-16 flex flex-col items-center gap-3 sm:flex-row">
      <SignUpButton
        mode="modal"
        forceRedirectUrl="/onboarding"
        signInForceRedirectUrl="/dashboard"
      >
        <button className="group inline-flex h-12 w-full items-center justify-center gap-2 border border-white bg-white px-7 text-sm font-semibold text-black transition-colors hover:bg-zinc-100 sm:w-auto">
          {t.hero.startFree}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </SignUpButton>
      <SignInButton
        mode="modal"
        forceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/onboarding"
      >
        <button className="inline-flex h-12 w-full items-center justify-center gap-2 border border-zinc-700 bg-zinc-950/60 px-7 text-sm font-medium text-zinc-200 backdrop-blur-md transition-colors hover:border-zinc-500 hover:text-white sm:w-auto">
          {t.hero.signIn}
        </button>
      </SignInButton>
    </div>
  );
}
