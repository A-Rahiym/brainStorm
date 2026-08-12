import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { SubjectDetailHeader } from "@/features/subjects/components/SubjectDetailHeader";
import { SubjectDetail } from "@/features/subjects/components/SubjectDetail";
import { findMockSubject } from "@/features/subjects/mock/subject-detail";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return <UnderConstructionState featureName="Subject" />;
  }

  const subjectName = findMockSubject(subjectId)?.name ?? "Subject";

  return (
    <>
      <SubjectDetailHeader subjectName={subjectName} />
      <SubjectDetail subjectId={subjectId} />
    </>
  );
}
