import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { createProgramme, listProgrammes } from "@/features/enrolment/service";
import { parseCreateProgrammeInput } from "@/features/enrolment/validation";

export async function GET() {
  const programmes = await listProgrammes();
  return NextResponse.json(programmes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseCreateProgrammeInput(body);
    const programme = await createProgramme(input);
    return NextResponse.json(programme, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
