import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server-session";
import { AttendanceHeader } from "@/features/attendance/components/AttendanceHeader";
import { AttendancePageClient } from "@/features/attendance/components/AttendancePageClient";
import { UnderConstructionState } from "@/components/feedback/UnderConstructionState";

export default async function AttendancePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  if (session.role !== "TEACHER") {
    return <UnderConstructionState featureName="Attendance" />;
  }
  return (
    <>
      <AttendanceHeader initialRole={session.role} />
      <AttendancePageClient />
    </>
  );
}
