import { Suspense } from "react";
import Link from "next/link";
import { Users, UserSearch } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { listProgrammeOptions, listStudents } from "@/features/enrolment/service";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrolmentStatusBadge } from "@/components/status-badges";
import { StudentFilters } from "@/features/enrolment/components/student-filters";
import { NewStudentDialog } from "@/features/enrolment/components/new-student-dialog";
import { NewProgrammeDialog } from "@/features/enrolment/components/new-programme-dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { formatDate } from "@/lib/format";
import type { EnrolmentStatus } from "@/generated/prisma/client";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; programmeId?: string; status?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const [students, programmes] = await Promise.all([
    listStudents({
      search: params.search,
      programmeId: params.programmeId,
      status: params.status as EnrolmentStatus | undefined,
    }),
    listProgrammeOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Students"
        description="Enrol, search, and manage Registry student records."
        action={
          <>
            <NewProgrammeDialog />
            <NewStudentDialog programmes={programmes} />
          </>
        }
      />

      <Suspense>
        <StudentFilters programmes={programmes} />
      </Suspense>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead className="text-right">Academic Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState icon={UserSearch} message="No students match these filters." />
                  </TableCell>
                </TableRow>
              )}
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/students/${s.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {s.studentId}
                    </Link>
                  </TableCell>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.programme.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.academicYear}</TableCell>
                  <TableCell>
                    <EnrolmentStatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
