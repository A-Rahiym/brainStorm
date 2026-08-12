import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { StudentsHeader } from "@/features/students/components/StudentsHeader";
import { StudentsPageClient } from "@/features/students/components/StudentsPageClient";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function StudentsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return <UnderConstructionState featureName="Students" />;
  }
  return (
    <>
      <StudentsHeader initialRole={session.role} />
      <StudentsPageClient />
    </>
  );
}
