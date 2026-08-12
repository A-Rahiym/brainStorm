import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { Providers } from "@/lib/providers";
import { MainShell } from "@/components/layout/DashboardShell";
import { SessionHydrator } from "@/components/layout/SessionHydrator";
import { NotFoundState } from "@/components/feedback/NotFoundState";

export default async function NotFound() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <Providers>
      <SessionHydrator session={session} />
      <MainShell>
        <NotFoundState />
      </MainShell>
    </Providers>
  );
}
