"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnrolmentStatus } from "@/generated/prisma/client";
import type { EditableStudent, ProgrammeOption } from "@/features/enrolment/types";
import { toDateInputValue } from "@/lib/format";

const STATUSES: EnrolmentStatus[] = ["ENROLLED", "DEFERRED", "WITHDRAWN", "COMPLETED"];

export function StudentEditForm({
  student,
  programmes,
}: {
  student: EditableStudent;
  programmes: ProgrammeOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [programmeId, setProgrammeId] = useState(student.programmeId);
  const [status, setStatus] = useState<EnrolmentStatus>(student.status);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          academicYear: formData.get("academicYear"),
          feeDueDate: formData.get("feeDueDate"),
          programmeId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update student.");
      toast.success("Student updated.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={student.email} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Programme</Label>
        <Select value={programmeId} onValueChange={(value) => value && setProgrammeId(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {programmes.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Enrolment status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as EnrolmentStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="academicYear">Academic year</Label>
        <Input
          id="academicYear"
          name="academicYear"
          type="number"
          defaultValue={student.academicYear}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feeDueDate">Fee due date</Label>
        <Input
          id="feeDueDate"
          name="feeDueDate"
          type="date"
          defaultValue={toDateInputValue(student.feeDueDate)}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
