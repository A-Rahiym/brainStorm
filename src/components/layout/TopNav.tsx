"use client";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session.store";
import {
  ChevronDownIcon,
  DashboardIcon,
  GridIcon,
  PaymentsIcon,
  ResultsIcon,
  SearchIcon,
  StudentsIcon,
  SubjectsIcon,
  TeachersIcon,
  UsersIcon,
} from "@/components/icons";


const navGroups: Record<
  "HEADMASTER" | "TEACHER",
  { href: string; label: string; icon: React.ReactNode }[]
> = {
  HEADMASTER: [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon size={17} /> },
    { href: "/subjects", label: "Subjects", icon: <SubjectsIcon size={17} /> },
    { href: "/students", label: "Students", icon: <StudentsIcon size={17} /> },
    { href: "/teachers", label: "Teachers", icon: <TeachersIcon size={17} /> },
    { href: "/results", label: "Results", icon: <ResultsIcon size={17} /> },
    { href: "/payments", label: "Payments", icon: <PaymentsIcon size={17} /> },
  ],
  TEACHER: [
    { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon size={17} /> },
    { href: "/subjects", label: "Subjects", icon: <SubjectsIcon size={17} /> },
    { href: "/students", label: "Students", icon: <StudentsIcon size={17} /> },
    { href: "/attendance", label: "Attendance", icon: <UsersIcon size={17} /> },
    { href: "/assessments", label: "Assessments", icon: <ResultsIcon size={17} /> },
    { href: "/grades", label: "Grades", icon: <ResultsIcon size={17} /> },
  ],
};

export function TopNav() {
  const pathname = usePathname();
  const role = useSessionStore((s) => s.role) ?? "HEADMASTER";
  const items = navGroups[role] ?? navGroups.HEADMASTER;

  return (


      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-7">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-3xl text-text-primary">
          <span className="flex h-8.5 w-8.5 items-center justify-center   text-white">
            <Image
              src={"/Logo.svg"}
              alt="Logo"
              width={35}
              height={35}
            />
          </span>
          Brainstorm
          <span className="text-xs text-text-muted">
            <ChevronDownIcon size={12} />
          </span>
        </Link>

        <div className="flex w-full min-w-0 items-center justify-center gap-1 rounded-full bg-white p-2 shadow lg:w-auto lg:flex-1 xl:p-3">
          <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto rounded-full" aria-label="Primary">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4 ${active ? "bg-primary-light text-primary" : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1 rounded-full">
            <button aria-label="Apps" className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-text-secondary hover:bg-bg">
              <GridIcon size={18} />
            </button>
            <label className="hidden items-center gap-2 rounded-full bg-bg px-3.5 py-2 text-sm text-text-muted lg:flex">
              <SearchIcon size={16} />
              <input
                placeholder="Search.."
                className="w-3/4  bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none "
              />
            </label>
          </div>
        </div>
      </div>

  );
}
