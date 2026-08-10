import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { SubjectsHeader } from "@/features/subjects/components/SubjectsHeader";
import { SubjectsOverview } from "@/features/subjects/components/SubjectsOverview";

export default async function SubjectsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">Subjects</h1>
        <p className="mt-1 text-sm text-text-secondary">This view is coming soon for your role.</p>
      </div>
    );
  }

  return (
    <>
      <SubjectsHeader initialRole={session.role} />
      <SubjectsOverview />
    </>
  );
}
