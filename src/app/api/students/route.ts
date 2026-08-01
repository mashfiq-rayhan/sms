import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createStudent, listStudents } from "@/features/enrolment/service";
import { parseCreateStudentInput } from "@/features/enrolment/validation";
import type { EnrolmentStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const students = await listStudents({
    search: searchParams.get("search") ?? undefined,
    programmeId: searchParams.get("programmeId") ?? undefined,
    status: (searchParams.get("status") as EnrolmentStatus | null) ?? undefined,
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseCreateStudentInput(body);
    const student = await createStudent(input);
    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
