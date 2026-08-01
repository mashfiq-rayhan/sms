import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { getStudentById, updateStudent } from "@/features/enrolment/service";
import { parseUpdateStudentInput } from "@/features/enrolment/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = parseUpdateStudentInput(body);
    const student = await updateStudent(id, input);
    return NextResponse.json(student);
  } catch (err) {
    return errorResponse(err);
  }
}
