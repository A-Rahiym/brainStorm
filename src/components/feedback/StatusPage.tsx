"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ChevronRightIcon } from "@/components/icons";
import type { IconProps } from "@/components/icons";

export type StatusJumpLink = {
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
  href: string;
};

export function StatusPage({
  tone,
  eyebrow,
  heading,
  lede,
  primaryHref = "/dashboard",
  primaryLabel = "Back to dashboard",
  secondaryLabel,
  onSecondaryClick,
  sectionTitle,
  jumps,
  refText,
  glyph,
  noteTitle,
  noteBody,
  footnoteText,
  footnoteLinkLabel,
  footnoteHref,
}: {
  tone: "error" | "build";
  eyebrow: string;
  heading: string;
  lede: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryLabel: string;
  onSecondaryClick?: () => void;
  sectionTitle: string;
  jumps: StatusJumpLink[];
  refText?: string;
  glyph: "missing" | "pending";
  noteTitle: string;
  noteBody: string;
  footnoteText: string;
  footnoteLinkLabel: string;
  footnoteHref: string;
}) {
  const isError = tone === "error";

  return (
    <div className="grid min-h-[calc(100vh-140px)] place-items-center py-9">
      <section className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-card md:grid-cols-[1fr_260px]">
        <div className="flex flex-col p-8 md:p-12">
          <p
            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
              isError ? "bg-schedule-red-bg text-schedule-red" : "bg-warning-bg text-warning-text"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {eyebrow}
          </p>

          <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-[-0.02em] text-text-primary">
            {heading}
          </h1>
          <p className="mt-3.5 max-w-[46ch] text-[15px] leading-relaxed text-text-secondary">{lede}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(159,18,68,0.24)] transition-colors hover:bg-primary-dark"
            >
              {primaryLabel}
            </Link>
            <button
              type="button"
              onClick={onSecondaryClick}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg"
            >
              {secondaryLabel}
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wide text-text-muted">{sectionTitle}</h2>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {jumps.map((jump) => (
                <Link
                  key={jump.href}
                  href={jump.href}
                  className="flex items-center gap-2.5 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary-light/30"
                >
                  <jump.icon size={18} className="shrink-0 text-primary" />
                  <span className="min-w-0">
                    <b className="block text-sm font-bold text-text-primary">{jump.title}</b>
                    <span className="block truncate text-xs font-medium text-text-secondary">
                      {jump.description}
                    </span>
                  </span>
                  <ChevronRightIcon size={14} className="ml-auto shrink-0 text-text-muted" />
                </Link>
              ))}
            </div>
            {refText && <p className="mt-5 text-xs font-medium text-text-muted">{refText}</p>}
          </div>
        </div>

        <aside className="flex flex-col items-center justify-center gap-5 border-t border-border bg-bg p-8 md:border-l md:border-t-0">
          <div className="grid grid-cols-2 gap-2.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => {
              if (glyph === "missing" && i === 2) {
                return (
                  <span key={i} className="h-13.5 w-13.5 rounded-2xl border-2 border-dashed border-primary/25" />
                );
              }
              if (glyph === "pending" && (i === 1 || i === 2)) {
                return (
                  <span key={i} className="h-13.5 w-13.5 animate-pulse rounded-2xl bg-primary opacity-80" />
                );
              }
              return <span key={i} className="h-13.5 w-13.5 rounded-2xl bg-primary opacity-90" />;
            })}
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-primary-dark">{noteTitle}</p>
            <p className="mt-1.5 max-w-[30ch] text-[13px] font-medium leading-relaxed text-primary-dark/80">
              {noteBody}
            </p>
          </div>
        </aside>
      </section>

      <p className="mt-6 text-center text-sm font-medium text-text-secondary">
        {footnoteText}{" "}
        <Link href={footnoteHref} className="font-semibold text-primary hover:underline">
          {footnoteLinkLabel}
        </Link>
      </p>
    </div>
  );
}
