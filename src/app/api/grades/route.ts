import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { enterGrade, listGradesForAssessment, listGradesForStudent } from "@/features/results/service";
import { parseEnterGradeInput } from "@/features/results/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessmentId");
  const studentId = searchParams.get("studentId");

  if (assessmentId) return NextResponse.json(await listGradesForAssessment(assessmentId));
  if (studentId) return NextResponse.json(await listGradesForStudent(studentId));
  return NextResponse.json({ error: "assessmentId or studentId query param is required." }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseEnterGradeInput(body);
    const grade = await enterGrade(input);
    return NextResponse.json(grade, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
