import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { setGradePublished } from "@/features/results/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const published = Boolean(body.published);
    const grade = await setGradePublished(id, published);
    return NextResponse.json(grade);
  } catch (err) {
    return errorResponse(err);
  }
}
