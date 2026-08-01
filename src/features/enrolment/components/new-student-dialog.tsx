"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProgrammeOption } from "@/features/enrolment/types";

function defaultFeeDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function NewStudentDialog({ programmes }: { programmes: ProgrammeOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [programmeId, setProgrammeId] = useState<string>(programmes[0]?.id ?? "");

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          dob: formData.get("dob"),
          programmeId,
          academicYear: formData.get("academicYear"),
          feeDueDate: formData.get("feeDueDate"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create student.");
      toast.success(`Student ${data.studentId} enrolled.`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New Student</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enrol a new student</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dob">Date of birth</Label>
              <Input id="dob" name="dob" type="date" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Programme</Label>
            {programmes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a programme first.</p>
            ) : (
              <Select value={programmeId} onValueChange={(value) => value && setProgrammeId(value)}>
                <SelectTrigger className="w-full">
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
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="academicYear">Academic year</Label>
              <Input
                id="academicYear"
                name="academicYear"
                type="number"
                defaultValue={new Date().getFullYear()}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="feeDueDate">Fee due date</Label>
              <Input id="feeDueDate" name="feeDueDate" type="date" defaultValue={defaultFeeDueDate()} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || programmes.length === 0}>
              {submitting ? "Enrolling…" : "Enrol student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
