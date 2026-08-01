import { NextResponse } from "next/server";
import { setActingStudent, setRole } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();
  if (body.role === "staff" || body.role === "student") {
    await setRole(body.role);
  }
  if (typeof body.studentId === "string" && body.studentId) {
    await setActingStudent(body.studentId);
  }
  return NextResponse.json({ ok: true });
}
