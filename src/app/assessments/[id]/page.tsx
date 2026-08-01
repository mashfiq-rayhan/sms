import { notFound } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { getAssessmentById } from "@/features/assessments/service";
import { listStudentsBasic } from "@/features/enrolment/service";
import { listGradesForAssessment } from "@/features/results/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GradeEntryRow } from "@/features/results/components/grade-entry-row";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { formatDateTime } from "@/lib/format";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [assessment, students, grades] = await Promise.all([
    getAssessmentById(id),
    listStudentsBasic(),
    listGradesForAssessment(id),
  ]);
  if (!assessment) notFound();

  const submissionByStudent = new Map(assessment.submissions.map((s) => [s.studentId, s]));
  const gradeByStudent = new Map(grades.map((g) => [g.studentId, g]));

  return (
    <div className="flex flex-col gap-6">
      <BackLink href="/assessments" label="Back to Assessments" />

      <PageHeader
        icon={ClipboardCheck}
        title={assessment.title}
        description={`${assessment.module} · Deadline ${formatDateTime(assessment.deadline)}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Submissions &amp; grading</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Visibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <GradeEntryRow
                  key={s.id}
                  assessmentId={assessment.id}
                  studentId={s.id}
                  studentLabel={`${s.fullName} (${s.studentId})`}
                  submission={submissionByStudent.get(s.id) ?? null}
                  grade={gradeByStudent.get(s.id) ?? null}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
