import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function GradesPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return <UnderConstructionState featureName="Grades" />;
}
