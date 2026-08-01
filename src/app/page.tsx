import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  TriangleAlert,
  CalendarClock,
  BookOpen,
  Wallet,
  GraduationCap,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { listStudents } from "@/features/enrolment/service";
import { listOverdueBalances, getStudentBalance } from "@/features/fees/service";
import { listAssessments } from "@/features/assessments/service";
import { listGradesForStudent } from "@/features/results/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverdueBadge } from "@/components/status-badges";
import { DashboardHero } from "@/components/dashboard-hero";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const { role, studentId } = await getSession();

  if (role === "staff") {
    const [students, overdue, assessments] = await Promise.all([
      listStudents({}),
      listOverdueBalances(),
      listAssessments(),
    ]);

    const now = new Date();
    const upcoming = assessments
      .filter((a) => a.deadline > now)
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
      .slice(0, 5);

    return (
      <div className="flex flex-col gap-6">
        <DashboardHero
          icon={LayoutDashboard}
          eyebrow="Registry Overview"
          title="Welcome back"
          description="Enrolment, fees, and upcoming assessment activity across the Registry, at a glance."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label="Total students" value={students.length} tone="indigo" />
          <StatCard
            icon={TriangleAlert}
            label="Overdue balances"
            value={overdue.length}
            tone={overdue.length > 0 ? "rose" : "emerald"}
          />
          <StatCard icon={CalendarClock} label="Upcoming deadlines" value={upcoming.length} tone="amber" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-rose-500" />
              Students with overdue fees
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {overdue.length === 0 ? (
              <EmptyState icon={Wallet} message="No overdue balances — nice." />
            ) : (
              overdue.map((b) => (
                <Link
                  key={b.student.id}
                  href={`/students/${b.student.id}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <span>
                    {b.student.fullName} · {b.student.studentId}
                  </span>
                  <span className="flex items-center gap-2">
                    {formatCurrency(b.outstanding)} outstanding <OverdueBadge overdue={b.overdue} />
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-amber-500" />
              Upcoming assessment deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarClock} message="Nothing scheduled." />
            ) : (
              upcoming.map((a) => (
                <Link
                  key={a.id}
                  href={`/assessments/${a.id}`}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm hover:bg-muted"
                >
                  <span>
                    {a.title} <span className="text-muted-foreground">({a.module})</span>
                  </span>
                  <span className="text-muted-foreground">{formatDate(a.deadline)}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!studentId) {
    return (
      <EmptyState icon={Users} message="Pick a student to log in as from the role switcher above." />
    );
  }

  const [balance, grades] = await Promise.all([
    getStudentBalance(studentId),
    listGradesForStudent(studentId, { onlyPublished: true }),
  ]);

  if (!balance) return <EmptyState icon={Users} message="Student not found." />;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHero
        icon={GraduationCap}
        eyebrow={balance.student.studentId}
        title={`Welcome, ${balance.student.fullName.split(" ")[0]}`}
        description="Here's where things stand with your fees, submissions, and results."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="Programme" value={balance.student.programme.name} tone="violet" />
        <StatCard
          icon={Wallet}
          label="Outstanding balance"
          tone={balance.overdue ? "rose" : "emerald"}
          value={
            <span className="flex items-center gap-2">
              {formatCurrency(balance.outstanding)}
              <OverdueBadge overdue={balance.overdue} />
            </span>
          }
        />
        <StatCard icon={GraduationCap} label="Published results" value={grades.length} tone="indigo" />
      </div>
      <p className="text-sm text-muted-foreground">
        Head to{" "}
        <Link href="/assessments" className="underline underline-offset-2">
          Assessments
        </Link>{" "}
        to submit your work, or{" "}
        <Link href="/results" className="underline underline-offset-2">
          My Marksheet
        </Link>{" "}
        to see published results.
      </p>
    </div>
  );
}
