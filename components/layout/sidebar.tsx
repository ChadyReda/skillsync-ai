"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Map,
  Briefcase,
  MessageCircle,
  Search,
  Star,
  ClipboardList,
  User,
  Menu,
  X,
  Mail,
  GitBranch,
  KanbanSquare,
} from "lucide-react";

function HiloSquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
    </svg>
  );
}
import { ThemeToggle } from "@/components/ui/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const candidateNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/feed", label: "Sync Feed", icon: Zap },
  { href: "/dashboard/ai", label: "AI Assistant", icon: HiloSquareIcon },
  { href: "/dashboard/cv", label: "Resume", icon: FileText },
  { href: "/dashboard/github", label: "GitHub", icon: GitBranch },
  { href: "/dashboard/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/jobs-tracker", label: "Jobs Tracker", icon: KanbanSquare },
  { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
];

const recruiterNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/feed", label: "Sync Feed", icon: Zap },
  { href: "/dashboard/recruiter/search", label: "Find Talent", icon: Search },
  { href: "/dashboard/recruiter/shortlist", label: "Shortlist", icon: Star },
  { href: "/dashboard/recruiter/jobs", label: "Manage Jobs", icon: Briefcase },
  {
    href: "/dashboard/recruiter/applications",
    label: "Applications",
    icon: ClipboardList,
  },
  { href: "/dashboard/outreach", label: "AI Outreach", icon: Mail },
  { href: "/dashboard/chat", label: "Messages", icon: MessageCircle },
];

interface SidebarProps {
  role: string | null;
  userId: string;
}

export default function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = role === "recruiter" ? recruiterNav : candidateNav;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const portfolioActive = pathname.startsWith("/dashboard/candidates");

  function NavContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link
          href="/"
          className="flex h-[72px] shrink-0 items-center gap-3 border-b border-zinc-800/60 px-5 transition-opacity duration-150 hover:opacity-80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm">
            <Image
              width={64}
              height={64}
              src="/logo.png"
              alt="SkillSync Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-semibold tracking-[0.18em] text-white">
              SKILLSYNC
            </span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600">
              AI career OS
            </span>
          </div>
        </Link>

        {/* Role badge */}
        <div className="border-b border-zinc-800/60 px-5 py-3">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400/80 backdrop-blur-sm"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }}
            />
            {role || "User"}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-2 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-700">
            Workspace
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                    active
                      ? "bg-white/[0.07] text-white"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
                  ].join(" ")}
                  style={
                    active
                      ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset" }
                      : undefined
                  }
                >
                  <item.icon
                    className={[
                      "h-4 w-4 shrink-0 transition-colors duration-150",
                      active
                        ? "text-white"
                        : "text-zinc-600 group-hover:text-zinc-300",
                    ].join(" ")}
                  />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/60"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Portfolio link (candidates only) */}
          {role === "candidate" && (
            <>
              <p className="mb-2 mt-6 px-2 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-700">
                Profile
              </p>
              <Link
                href={`/dashboard/candidates/${userId}`}
                onClick={() => setMobileOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  portfolioActive
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
                ].join(" ")}
                style={
                  portfolioActive
                    ? { boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset" }
                    : undefined
                }
              >
                <User
                  className={[
                    "h-4 w-4 shrink-0 transition-colors duration-150",
                    portfolioActive
                      ? "text-white"
                      : "text-zinc-600 group-hover:text-zinc-300",
                  ].join(" ")}
                />
                <span className="truncate">My Portfolio</span>
                {portfolioActive && (
                  <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                )}
              </Link>
            </>
          )}
        </nav>

        {/* User section */}
        <div className="flex shrink-0 items-center gap-3 border-t border-zinc-800/60 px-4 py-4">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7 rounded-lg border border-zinc-800",
              },
            }}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">
              Signed in as
            </span>
            <span className="truncate text-xs font-medium capitalize text-zinc-300">
              {role || "User"}
            </span>
          </div>
          <ThemeToggle className="shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800/60 bg-black/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm">
            <Image
              width={48}
              height={48}
              src="/logo.png"
              alt="SkillSync Logo"
              className="h-5 w-5 object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-[0.16em] text-white">
            SKILLSYNC
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-1.5 text-zinc-400 backdrop-blur-sm transition-colors duration-150 hover:border-zinc-700 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={[
          "fixed bottom-0 left-0 top-14 z-40 w-64 transform border-r border-zinc-800/60 bg-black transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <NavContent />
      </div>

      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-800/60 bg-black lg:flex lg:flex-col">
        <NavContent />
      </div>
    </>
  );
}
