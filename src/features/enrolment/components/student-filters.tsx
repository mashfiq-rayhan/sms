"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnrolmentStatus } from "@/generated/prisma/client";
import type { ProgrammeOption } from "@/features/enrolment/types";

const STATUSES: EnrolmentStatus[] = ["ENROLLED", "DEFERRED", "WITHDRAWN", "COMPLETED"];

export function StudentFilters({ programmes }: { programmes: ProgrammeOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Search by name, ID, or email…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          updateParam("search", e.target.value);
        }}
        className="w-64"
      />
      <Select
        value={searchParams.get("programmeId") ?? "all"}
        onValueChange={(value) => updateParam("programmeId", value ?? "all")}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All programmes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All programmes</SelectItem>
          {programmes.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateParam("status", value ?? "all")}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
