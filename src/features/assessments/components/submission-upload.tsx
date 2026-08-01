"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LateBadge } from "@/components/status-badges";
import { formatDateTime } from "@/lib/format";

type ExistingSubmission = {
  id: string;
  fileName: string;
  isLate: boolean;
  submittedAt: string | Date;
};

export function SubmissionUpload({
  assessmentId,
  deadline,
  submission,
}: {
  assessmentId: string;
  deadline: string | Date;
  submission: ExistingSubmission | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPastDeadline = new Date() > new Date(deadline);
  const canUpload = !submission || !isPastDeadline;

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch(`/api/assessments/${assessmentId}/submissions`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      toast.success(submission ? "Resubmitted." : "Submitted.");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {submission ? (
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/api/submissions/${submission.id}/file`}
            className="underline underline-offset-2"
          >
            {submission.fileName}
          </a>
          <span className="text-muted-foreground">· {formatDateTime(submission.submittedAt)}</span>
          <LateBadge late={submission.isLate} />
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Not submitted yet.</span>
      )}

      {canUpload ? (
        <div className="flex items-center gap-2">
          <Input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="max-w-64" />
          <Button size="sm" onClick={handleUpload} disabled={submitting}>
            {submitting ? "Uploading…" : submission ? "Resubmit" : "Submit"}
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          Deadline has passed — resubmission is closed.
        </span>
      )}
    </div>
  );
}
