import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function PaymentsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return <UnderConstructionState featureName="Payments" />;
}
