"use client";

import { useRouter } from "next/navigation";
import { StatusPage } from "@/components/feedback/StatusPage";
import { StudentsIcon, UsersIcon, ResultsIcon, SubjectsIcon } from "@/components/icons";

export function NotFoundState({ requestedPath }: { requestedPath?: string }) {
  const router = useRouter();

  return (
    <StatusPage
      tone="error"
      eyebrow="Not found"
      heading="We couldn't find that resource."
      lede="The page you're looking for isn't available at this address. It may have been moved, renamed, or removed. Everything else in your school's records is safe and exactly where you left it."
      secondaryLabel="Go back"
      onSecondaryClick={() => router.back()}
      sectionTitle="Where to next"
      jumps={[
        { icon: SubjectsIcon, title: "Subjects", description: "Your assigned subjects", href: "/subjects" },
        { icon: StudentsIcon, title: "My Students", description: "Across your classes", href: "/students" },
        { icon: UsersIcon, title: "Attendance", description: "Take today's register", href: "/attendance" },
        { icon: ResultsIcon, title: "Assessments", description: "Assignments and quizzes", href: "/assessments" },
      ]}
      refText={requestedPath ? `Requested address ${requestedPath}` : undefined}
      glyph="missing"
      noteTitle="Nothing is lost"
      noteBody="Pick up where you left off below."
      footnoteText="Need a hand?"
      footnoteLinkLabel="Contact your school administrator"
      footnoteHref="/dashboard"
    />
  );
}
