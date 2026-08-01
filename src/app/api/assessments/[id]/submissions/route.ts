import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { getSession } from "@/lib/session";
import { ResubmissionClosedError, submitAssessment } from "@/features/assessments/service";
import { InvalidUploadError } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { role, studentId } = await getSession();
    if (role !== "student" || !studentId) {
      return NextResponse.json({ error: "Only a student may submit work, as themselves." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const submission = await submitAssessment(id, studentId, file);
    return NextResponse.json(submission, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidUploadError) return errorResponse(err);
    if (err instanceof ResubmissionClosedError) return errorResponse(err, 409);
    return errorResponse(err);
  }
}
