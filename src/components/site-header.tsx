import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getSession } from "@/lib/session";
import { listStudentsBasic } from "@/features/enrolment/service";
import { RoleSwitcher } from "@/components/role-switcher";
import { NavLinks } from "@/components/nav-links";

export async function SiteHeader() {
  const { role, studentId } = await getSession();
  const students = await listStudentsBasic();

  const navItems =
    role === "staff"
      ? [
          { href: "/", label: "Dashboard", icon: "dashboard" as const },
          { href: "/students", label: "Students", icon: "students" as const },
          { href: "/fees", label: "Fees", icon: "fees" as const },
          { href: "/assessments", label: "Assessments", icon: "assessments" as const },
          { href: "/results", label: "Results", icon: "results" as const },
        ]
      : [
          { href: "/", label: "Dashboard", icon: "dashboard" as const },
          { href: "/assessments", label: "Assessments", icon: "assessments" as const },
          { href: "/results", label: "My Marksheet", icon: "results" as const },
        ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--chart-2)] to-primary text-primary-foreground shadow-sm shadow-primary/30">
              <GraduationCap className="size-4.5" />
            </span>
            SMS Registry
          </Link>
          <NavLinks items={navItems} />
        </div>
        <RoleSwitcher role={role} studentId={studentId} students={students} />
      </div>
    </header>
  );
}
