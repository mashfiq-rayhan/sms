import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { resolveUploadPath } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Submission not found." }, { status: 404 });

  const buffer = await readFile(resolveUploadPath(submission.filePath));
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": submission.mimeType,
      "Content-Disposition": `attachment; filename="${submission.fileName}"`,
    },
  });
}
