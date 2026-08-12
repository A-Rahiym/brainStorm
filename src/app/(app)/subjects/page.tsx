import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { SubjectsHeader } from "@/features/subjects/components/SubjectsHeader";
import { SubjectsOverview } from "@/features/subjects/components/SubjectsOverview";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function SubjectsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return <UnderConstructionState featureName="Subjects" />;
  }

  return (
    <>
      <SubjectsHeader initialRole={session.role} />
      <SubjectsOverview />
    </>
  );
}
