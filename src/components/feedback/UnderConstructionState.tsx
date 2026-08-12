"use client";

import { StatusPage } from "@/components/feedback/StatusPage";
import { StudentsIcon, ResultsIcon } from "@/components/icons";
import { useUiStore } from "@/store/ui.store";

export function UnderConstructionState({ featureName }: { featureName?: string }) {
  const showToast = useUiStore((s) => s.showToast);

  return (
    <StatusPage
      tone="build"
      eyebrow="Coming soon"
      heading={featureName ? `${featureName} is coming soon.` : "Coming soon."}
      lede="We're putting the finishing touches on this section. It'll open up here shortly, and everything you already use stays right where it is."
      secondaryLabel="Notify me when it's ready"
      onSecondaryClick={() => showToast({ type: "success", message: "We'll let you know when it's ready" })}
      sectionTitle="Ready to use today"
      jumps={[
        { icon: ResultsIcon, title: "Grades", description: "Enter CA and exam scores", href: "/grades" },
        { icon: StudentsIcon, title: "My Students", description: "Per-student totals and grades", href: "/students" },
      ]}
      refText="Arriving in the First term, 2026 release"
      glyph="pending"
      noteTitle="Almost ready"
      noteBody="We'd rather ship it right than ship it early."
      footnoteText="Something you'd like to see here?"
      footnoteLinkLabel="Tell us"
      footnoteHref="/dashboard"
    />
  );
}
