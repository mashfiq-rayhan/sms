import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createAssessment, listAssessments } from "@/features/assessments/service";
import { parseCreateAssessmentInput } from "@/features/assessments/validation";

export async function GET() {
  const assessments = await listAssessments();
  return NextResponse.json(assessments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseCreateAssessmentInput(body);
    const assessment = await createAssessment(input);
    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
