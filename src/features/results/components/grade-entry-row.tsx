"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { ClassificationBadge, LateBadge } from "@/components/status-badges";
import type { Classification } from "@/generated/prisma/client";
import { formatDateTime } from "@/lib/format";

type Submission = { fileName: string; isLate: boolean; submittedAt: string | Date } | null;
type Grade = { id: string; score: number; classification: Classification; published: boolean } | null;

export function GradeEntryRow({
  assessmentId,
  studentId,
  studentLabel,
  submission,
  grade,
}: {
  assessmentId: string;
  studentId: string;
  studentLabel: string;
  submission: Submission;
  grade: Grade;
}) {
  const router = useRouter();
  const [score, setScore] = useState(grade?.score?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function saveGrade() {
    setSaving(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, studentId, score: Number(score) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save grade.");
      toast.success("Grade saved.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!grade) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/grades/${grade.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !grade.published }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update publish state.");
      toast.success(grade.published ? "Result withheld." : "Result published.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <TableRow>
      <TableCell>{studentLabel}</TableCell>
      <TableCell>
        {submission ? (
          <span className="flex items-center gap-2">
            {formatDateTime(submission.submittedAt)}
            <LateBadge late={submission.isLate} />
          </span>
        ) : (
          <span className="text-muted-foreground">No submission</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-20"
          />
          <Button size="sm" variant="outline" onClick={saveGrade} disabled={saving || score === ""}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </TableCell>
      <TableCell>{grade && <ClassificationBadge classification={grade.classification} />}</TableCell>
      <TableCell>
        {grade && (
          <Button size="sm" variant={grade.published ? "secondary" : "default"} onClick={togglePublish} disabled={publishing}>
            {grade.published ? "Withhold" : "Publish"}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
