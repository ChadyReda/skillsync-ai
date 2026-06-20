"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowUpRight } from "lucide-react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <div
          className={`flex items-center gap-3 rounded-full border px-3 py-[2px] pr-4 transition-all duration-300 ${
            scrolled
              ? "border-white/10 bg-white/10 backdrop-blur-xl dark:bg-white/5"
              : "border-transparent bg-transparent"
          }`}
        >
          <Image
            src="/logo.png"
            alt="SkillSync"
            width={28}
            height={28}
            className="object-contain"
            priority
          />

          <span className="text-md uppercase font-medium tracking-tight text-black dark:text-white">
            SkillSync
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden items-center gap-1 sm:flex">
          {[
            { href: "/jobs", label: "Jobs" },
            { href: "/blog", label: "Blog" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:text-white dark:text-zinc-400"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div
            className={`rounded-full border p-1 transition-all duration-300 ${
              scrolled
                ? "border-white/10 bg-white/10 backdrop-blur-xl dark:bg-white/5"
                : "border-transparent bg-transparent"
            }`}
          >
            <ThemeToggle />
          </div>

          {isSignedIn ? (
            <Link
              href="/dashboard"
              className={`group flex h-10 items-center gap-1 rounded-full border px-4 text-sm font-medium transition-all duration-300 ${
                scrolled
                  ? "border-white/10 bg-white/10 text-black backdrop-blur-xl hover:bg-white/20 dark:bg-white/5 dark:text-white"
                  : "border-black/10 bg-black text-white hover:bg-zinc-800 dark:border-white/10 dark:bg-white dark:text-black"
              }`}
            >
              Workspace
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <SignUpButton
              mode="modal"
              forceRedirectUrl="/onboarding"
              signInForceRedirectUrl="/dashboard"
            >
              <button
                className={`group flex h-10 items-center gap-1 rounded-full border px-4 text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? "border-white/10 bg-white/10 text-black backdrop-blur-xl hover:bg-white/20 dark:bg-white/5 dark:text-white"
                    : "border-black/10 bg-black text-white hover:bg-zinc-800 dark:border-white/10 dark:bg-white dark:text-black"
                }`}
              >
                Lets GO!
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </SignUpButton>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
