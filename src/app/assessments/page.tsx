import Link from "next/link";
import { ClipboardList, CalendarClock, ClipboardX } from "lucide-react";
import { getSession, requireActingStudent } from "@/lib/session";
import { listAssessments, listSubmissionsForStudent } from "@/features/assessments/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewAssessmentDialog } from "@/features/assessments/components/new-assessment-dialog";
import { SubmissionUpload } from "@/features/assessments/components/submission-upload";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/lib/format";

export default async function AssessmentsPage() {
  const { role } = await getSession();

  if (role === "staff") {
    const assessments = await listAssessments();
    const now = new Date();
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          icon={ClipboardList}
          title="Assessments"
          description="Create assessments and review submissions."
          action={<NewAssessmentDialog />}
        />
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyState icon={ClipboardX} message="No assessments yet." />
                    </TableCell>
                  </TableRow>
                )}
                {assessments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link href={`/assessments/${a.id}`} className="underline-offset-2 hover:underline">
                        {a.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.module}</TableCell>
                    <TableCell>{formatDateTime(a.deadline)}</TableCell>
                    <TableCell>
                      {a.deadline > now ? (
                        <Badge variant="secondary">Open</Badge>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { studentId } = await requireActingStudent();
  const [assessments, submissions] = await Promise.all([
    listAssessments(),
    listSubmissionsForStudent(studentId),
  ]);
  const submissionByAssessment = new Map(submissions.map((s) => [s.assessmentId, s]));

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={ClipboardList}
        title="Assessments"
        description="Upload your work before the deadline for each open assessment."
      />
      {assessments.length === 0 && (
        <EmptyState icon={ClipboardX} message="No assessments yet." />
      )}
      {assessments.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
              <span>
                {a.title} <span className="font-normal text-muted-foreground">· {a.module}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                <CalendarClock className="size-4" />
                Due {formatDateTime(a.deadline)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionUpload
              assessmentId={a.id}
              deadline={a.deadline}
              submission={submissionByAssessment.get(a.id) ?? null}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
