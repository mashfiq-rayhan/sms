import { NextResponse } from "next/server";
import { getAssessmentById } from "@/features/assessments/service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const assessment = await getAssessmentById(id);
  if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
  return NextResponse.json(assessment);
}
