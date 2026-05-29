import type { Metadata } from "next";
import { InstallClient } from "./_components/install-client";

export const metadata: Metadata = {
  title: "Install App",
  description:
    "Add SkillSync to your home screen for instant access — no app store, no downloads. Works on Android, iPhone, and desktop.",
  robots: { index: true, follow: true },
};

export default function InstallPage() {
  return <InstallClient />;
}
