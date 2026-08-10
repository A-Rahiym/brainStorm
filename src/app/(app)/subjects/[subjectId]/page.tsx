import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { SubjectDetailHeader } from "@/features/subjects/components/SubjectDetailHeader";
import { SubjectDetail } from "@/features/subjects/components/SubjectDetail";
import { findMockSubject } from "@/features/subjects/mock/subject-detail";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">Subject</h1>
        <p className="mt-1 text-sm text-text-secondary">This view is coming soon for your role.</p>
      </div>
    );
  }

  const subjectName = findMockSubject(subjectId)?.name ?? "Subject";

  return (
    <>
      <SubjectDetailHeader subjectName={subjectName} />
      <SubjectDetail subjectId={subjectId} />
    </>
  );
}
