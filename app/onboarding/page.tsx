import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Set Up Your Profile",
  description: "Complete your SkillSync profile to get personalized AI career recommendations.",
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import Image from "next/image";

import { getCurrentDbUser } from "@/lib/auth";
import OnboardingForm from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const dbUser = await getCurrentDbUser();
  if (dbUser?.onboardingCompleted) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex h-14 items-center border-b border-zinc-800/60 px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
            <Image
              src="/logo.png"
              alt="SkillSync"
              width={48}
              height={48}
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            SkillSync
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <OnboardingForm />
      </main>
    </div>
  );
}
