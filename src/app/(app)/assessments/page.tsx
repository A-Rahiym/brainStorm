import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { AssessmentsHeader } from "@/features/assessments/components/AssessmentsHeader";
import { AssessmentsPageClient } from "@/features/assessments/components/AssessmentsPageClient";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function AssessmentsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return <UnderConstructionState featureName="Assessments" />;
  }
  return (
    <>
      <AssessmentsHeader initialRole={session.role} />
      <AssessmentsPageClient />
    </>
  );
}
