import { GraduationCap, Award } from "lucide-react";
import { getSession, requireActingStudent } from "@/lib/session";
import { listAllGrades, listGradesForStudent } from "@/features/results/service";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassificationBadge } from "@/components/status-badges";
import { GradePublishToggle } from "@/features/results/components/grade-publish-toggle";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/lib/format";

export default async function ResultsPage() {
  const { role } = await getSession();

  if (role === "staff") {
    const grades = await listAllGrades();
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          icon={GraduationCap}
          title="Results Overview"
          description="Every grade entered across all assessments — publish to release to students."
        />
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>Graded</TableHead>
                  <TableHead>Visibility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState icon={Award} message="No grades entered yet." />
                    </TableCell>
                  </TableRow>
                )}
                {grades.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      {g.student.fullName} ({g.student.studentId})
                    </TableCell>
                    <TableCell>{g.assessment.title}</TableCell>
                    <TableCell className="text-right tabular-nums">{g.score}</TableCell>
                    <TableCell>
                      <ClassificationBadge classification={g.classification} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(g.gradedAt)}</TableCell>
                    <TableCell>
                      <GradePublishToggle gradeId={g.id} published={g.published} />
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
  const grades = await listGradesForStudent(studentId, { onlyPublished: true });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={GraduationCap}
        title="My Marksheet"
        description="Results appear here once staff publish them."
      />
      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Classification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <EmptyState icon={Award} message="No published results yet." />
                  </TableCell>
                </TableRow>
              )}
              {grades.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.assessment.title}</TableCell>
                  <TableCell className="text-right tabular-nums">{g.score}</TableCell>
                  <TableCell>
                    <ClassificationBadge classification={g.classification} />
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
