import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { Providers } from "@/lib/providers";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SessionHydrator } from "@/components/layout/SessionHydrator";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <Providers>
      <SessionHydrator session={session} />
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
