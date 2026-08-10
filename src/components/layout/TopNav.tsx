"use client";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session.store";
import {
  ChevronDownIcon,
  DashboardIcon,
  GridIcon,
  LogOutIcon,
  PaymentsIcon,
  ResultsIcon,
  SearchIcon,
  StudentsIcon,
  SubjectsIcon,
  TeachersIcon,
  UsersIcon,
} from "@/components/icons";
import { useLogout } from "@/features/auth/hooks/mutations/useLogin";

const navGroups: Record<
  "HEADMASTER" | "TEACHER",
  { href: string; label: string; icon: React.ReactNode }[]
> = {
  HEADMASTER: [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon size={18} /> },
    { href: "/subjects", label: "Subjects", icon: <SubjectsIcon size={18} /> },
    { href: "/students", label: "Students", icon: <StudentsIcon size={18} /> },
    { href: "/teachers", label: "Teachers", icon: <TeachersIcon size={18} /> },
    { href: "/results", label: "Results", icon: <ResultsIcon size={18} /> },
    { href: "/payments", label: "Payments", icon: <PaymentsIcon size={18} /> },
  ],
  TEACHER: [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon size={18} /> },
    { href: "/subjects", label: "Subjects", icon: <SubjectsIcon size={18} /> },
    { href: "/students", label: "Students", icon: <StudentsIcon size={18} /> },
    { href: "/attendance", label: "Attendance", icon: <UsersIcon size={18} /> },
    { href: "/assessments", label: "Assessments", icon: <ResultsIcon size={18} /> },
    { href: "/grades", label: "Grades", icon: <ResultsIcon size={18} /> },
  ],
};

export function TopNav() {
  const pathname = usePathname();
  const role = useSessionStore((s) => s.role);
  const items = role ? navGroups[role] : [];
  

  return (
    <div className="flex items-center justify-start gap-4 px-4 py-4 sm:px-8 xl:gap-4.5">
      <Link
        href="/dashboard"
        className="flex flex-none items-center gap-2.5 text-[23px] font-bold tracking-[-0.02em] text-text-primary"
      >
        <span className="flex h-9 w-9 items-center justify-center">
          <Image src={"/Logo.svg"} alt="Logo" width={36} height={36} />
        </span>
        Brainstorm
        <span className="text-text-muted">
          <ChevronDownIcon size={14} />
        </span>
      </Link>


      <div className="flex h-14 items-center gap-0.5 rounded-full border border-border bg-surface p-1.5 shadow-card lg:w-auto">
        {items.length > 0 && (
          <nav
            className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full [&::-webkit-scrollbar]:hidden"
            aria-label="Primary"
          >
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 flex-none items-center gap-1.75 whitespace-nowrap rounded-full px-3 text-sm transition-colors ${active
                    ? "bg-primary-pill font-semibold text-primary"
                    : "font-medium text-text-primary hover:bg-bg"
                    }`}
                >
                  <span className={active ? "text-primary" : "text-text-secondary"}>
                    {item.icon}
                  </span>
                  <span className={active ? "inline" : "hidden xl:inline"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="ml-0.5 flex flex-none items-center gap-0.5">
          <button
            aria-label="Apps"
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg"
          >
            <GridIcon size={18} />
          </button>

          <label className="hidden h-11 items-center gap-2.5 rounded-full bg-bg pl-3.5 pr-4 text-sm text-text-muted lg:flex">
            <SearchIcon size={18} />
            <input
              placeholder="Search.."
              className="w-24 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none xl:w-32"
            />
          </label>

        </div>
      </div>
    </div>
  );
}