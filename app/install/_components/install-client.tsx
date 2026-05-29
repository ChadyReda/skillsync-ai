"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Smartphone,
  Monitor,
  Share2,
  CheckCircle2,
  Zap,
  WifiOff,
  LayoutGrid,
  Layers,
} from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "android" | "ios" | "desktop";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const benefits = [
  {
    icon: Zap,
    title: "Instant access",
    description: "Launch from your home screen — no browser needed.",
  },
  {
    icon: WifiOff,
    title: "Works offline",
    description: "Core features stay available even with poor connectivity.",
  },
  {
    icon: Layers,
    title: "Full-screen experience",
    description: "No browser chrome. Just SkillSync, edge to edge.",
  },
  {
    icon: LayoutGrid,
    title: "Feels native",
    description: "Lives alongside your other apps, launches instantly.",
  },
];

const tabs: { id: Platform; label: string }[] = [
  { id: "android", label: "Android" },
  { id: "ios", label: "iPhone / iPad" },
  { id: "desktop", label: "Desktop" },
];

export function InstallClient() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [activeTab, setActiveTab] = useState<Platform>("android");
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setActiveTab(p);

    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => setJustInstalled(true);

    window.addEventListener("beforeinstallprompt", promptHandler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setJustInstalled(true);
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const alreadyInstalled = isInstalled || justInstalled;

  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* Ambient top glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-25"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.12), transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SkillSync
        </Link>
        <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-sm">
          <Download className="h-3 w-3" />
          Install
        </span>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-4">
        {/* Page title */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            [ app / install ]
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Install SkillSync
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
            Add SkillSync to your home screen for a faster, distraction-free
            experience. No app store. No download. Instant.
          </p>
        </div>

        {/* App identity card */}
        <div
          className="mb-6 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <div className="flex items-center gap-5 p-6">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900">
              <Image
                src="/logo.png"
                alt="SkillSync"
                fill
                className="object-contain p-2.5"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-white">SkillSync</p>
              <p className="text-sm text-zinc-500">skillsync-ai.com</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["Free", "No app store required"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Already installed banner */}
        {alreadyInstalled && (
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-zinc-700/60 bg-zinc-900/50 p-5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-zinc-300" />
            <div>
              <p className="text-sm font-medium text-zinc-200">
                SkillSync is already installed
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                Launch it from your home screen or app drawer.
              </p>
            </div>
          </div>
        )}

        {/* One-tap install CTA */}
        {deferredPrompt && !alreadyInstalled && (
          <div className="mb-8">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-white font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-black transition-colors hover:bg-zinc-100 disabled:opacity-60 sm:w-auto sm:px-10"
            >
              <Download className="h-4 w-4" />
              {installing ? "Opening prompt…" : "Install app"}
            </button>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              Takes less than 5 seconds
            </p>
          </div>
        )}

        {/* Benefits grid */}
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900">
                <Icon className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Manual install instructions */}
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              01
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">
              Manual install guide
            </h2>
          </div>
          <p className="text-sm text-zinc-500">
            If you weren't prompted automatically, follow the steps for your
            platform below.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          {/* Platform tabs */}
          <div className="flex border-b border-zinc-800/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors sm:px-4 sm:text-[11px] ${
                  activeTab === tab.id
                    ? "border-b-2 border-white text-white"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "android" && (
              <StepList
                icon={Smartphone}
                title="Android — Chrome or Samsung Internet"
                steps={[
                  "Open skillsync-ai.com in Chrome",
                  "Tap the three-dot menu ( ⋮ ) in the top-right corner",
                  'Tap "Add to Home screen"',
                  'Confirm by tapping "Add" in the dialog',
                  "SkillSync appears on your home screen — tap to launch",
                ]}
              />
            )}
            {activeTab === "ios" && (
              <StepList
                icon={Share2}
                title="iPhone or iPad — Safari"
                steps={[
                  "Open skillsync-ai.com in Safari (not Chrome)",
                  "Tap the Share button ( □↑ ) at the bottom of the screen",
                  'Scroll down and tap "Add to Home Screen"',
                  "Edit the name if you like, then tap Add",
                  "SkillSync appears on your home screen like a native app",
                ]}
                note="This only works in Safari on iOS. Chrome and Firefox on iPhone do not support PWA installation due to Apple restrictions."
              />
            )}
            {activeTab === "desktop" && (
              <StepList
                icon={Monitor}
                title="Desktop — Chrome, Edge, or Brave"
                steps={[
                  "Open skillsync-ai.com in Chrome, Edge, or Brave",
                  "Look for the install icon ( ⊕ ) in the address bar on the right",
                  'Click it and select "Install"',
                  "SkillSync opens as a standalone window",
                  "Find it in your taskbar, Start Menu, or Applications folder",
                ]}
                note={`If you don't see the install icon, open the browser menu and look for "Install SkillSync" or "Cast, save, and share".`}
              />
            )}
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-8 flex justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-700">
          <Link href="/privacy" className="transition-colors hover:text-zinc-400">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-zinc-400">
            Terms
          </Link>
          <Link href="/report" className="transition-colors hover:text-zinc-400">
            Report an Issue
          </Link>
        </div>
      </section>
    </main>
  );
}

function StepList({
  icon: Icon,
  title,
  steps,
  note,
}: {
  icon: React.ElementType;
  title: string;
  steps: string[];
  note?: string;
}) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900">
          <Icon className="h-3.5 w-3.5 text-zinc-400" />
        </div>
        <p className="text-sm font-semibold text-zinc-200">{title}</p>
      </div>

      <ol className="space-y-3.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-mono text-[10px] text-zinc-500">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-zinc-400">{step}</span>
          </li>
        ))}
      </ol>

      {note && (
        <div className="mt-5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4">
          <p className="text-xs leading-relaxed text-zinc-500">{note}</p>
        </div>
      )}
    </div>
  );
}
