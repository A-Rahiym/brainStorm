import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { DashboardPageClient } from "@/features/dashboard/components/DashboardPageClient";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <>
      <DashboardHeader initialRole={session.role} />
      <DashboardPageClient initialRole={session.role} />
    </>
  );
}
