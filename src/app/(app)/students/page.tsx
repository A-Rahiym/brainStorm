import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { StudentsHeader } from "@/features/students/components/StudentsHeader";
import { StudentsPageClient } from "@/features/students/components/StudentsPageClient";

export default async function StudentsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">Students</h1>
        <p className="mt-1 text-sm text-text-secondary">This view is coming soon for your role.</p>
      </div>
    );
  }
  return (
    <>
      <StudentsHeader initialRole={session.role} />
      <StudentsPageClient />
    </>
  );
}
