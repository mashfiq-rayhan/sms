import { notFound } from "next/navigation";
import { User, Wallet, PiggyBank, GraduationCap, Receipt, FileText, Award } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { getStudentById, listProgrammeOptions } from "@/features/enrolment/service";
import { computeBalance } from "@/features/fees/service";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnrolmentStatusBadge, ClassificationBadge, LateBadge, OverdueBadge } from "@/components/status-badges";
import { StudentEditForm } from "@/features/enrolment/components/student-edit-form";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [student, programmes] = await Promise.all([getStudentById(id), listProgrammeOptions()]);
  if (!student) notFound();

  const balance = computeBalance(student);

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/students" label="Back to Students" />

      <PageHeader
        icon={User}
        title={student.fullName}
        description={`${student.studentId} · ${student.programme.name}`}
        action={<EnrolmentStatusBadge status={student.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Wallet}
          label="Fee balance"
          tone={balance.overdue ? "rose" : "emerald"}
          value={
            <span className="flex items-center gap-2">
              {formatCurrency(balance.outstanding)}
              <OverdueBadge overdue={balance.overdue} />
            </span>
          }
        />
        <StatCard icon={PiggyBank} label="Total paid" value={formatCurrency(balance.totalPaid)} tone="indigo" />
        <StatCard icon={GraduationCap} label="Programme fee" value={formatCurrency(balance.feeAmount)} tone="violet" />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments ({student.payments.length})</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({student.submissions.length})</TabsTrigger>
          <TabsTrigger value="grades">Grades ({student.grades.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardContent>
              <StudentEditForm
                student={{
                  id: student.id,
                  fullName: student.fullName,
                  email: student.email,
                  dob: student.dob,
                  programmeId: student.programmeId,
                  academicYear: student.academicYear,
                  status: student.status,
                  feeDueDate: student.feeDueDate,
                }}
                programmes={programmes}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="pt-4">
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <EmptyState icon={Receipt} message="No payments recorded." />
                      </TableCell>
                    </TableRow>
                  )}
                  {student.payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.paidAt)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(Number(p.amount))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.referenceNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="pt-4">
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState icon={FileText} message="No submissions yet." />
                      </TableCell>
                    </TableRow>
                  )}
                  {student.submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.assessment.title}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(s.submittedAt)}</TableCell>
                      <TableCell>
                        <a
                          href={`/api/submissions/${s.id}/file`}
                          className="underline underline-offset-2"
                        >
                          {s.fileName}
                        </a>
                      </TableCell>
                      <TableCell>
                        <LateBadge late={s.isLate} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="pt-4">
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Visibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.grades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState icon={Award} message="No grades entered yet." />
                      </TableCell>
                    </TableRow>
                  )}
                  {student.grades.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.assessment.title}</TableCell>
                      <TableCell className="text-right tabular-nums">{g.score}</TableCell>
                      <TableCell>
                        <ClassificationBadge classification={g.classification} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {g.published ? "Published" : "Withheld"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
