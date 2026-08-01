"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/session";

type StudentOption = { id: string; studentId: string; fullName: string };

export function RoleSwitcher({
  role,
  studentId,
  students,
}: {
  role: Role;
  studentId: string | null;
  students: StudentOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function updateSession(body: { role?: Role; studentId?: string }) {
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={(value) => updateSession({ role: value as Role })}>
        <SelectTrigger size="sm" className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="student">Student</SelectItem>
        </SelectContent>
      </Select>

      {role === "student" && (
        <Select
          value={studentId ?? undefined}
          onValueChange={(value) => value && updateSession({ studentId: value })}
        >
          <SelectTrigger size="sm" className="w-56">
            <SelectValue placeholder="Log in as..." />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.fullName} ({s.studentId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {isPending && <span className="text-xs text-muted-foreground">Switching…</span>}
    </div>
  );
}
