import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();

  if (!user) redirect("/");
  if (!user.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="flex h-screen overflow-hidden bg-black transition-colors duration-200">
      <Sidebar role={user.role} userId={user.id} />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
