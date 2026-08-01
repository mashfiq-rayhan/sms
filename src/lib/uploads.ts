import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "uploads");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // legacy .doc, tolerated
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".doc"]);

export class InvalidUploadError extends Error {}

export async function saveSubmissionFile(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new InvalidUploadError("Only PDF or DOCX files are accepted.");
  }

  await mkdir(UPLOAD_ROOT, { recursive: true });

  const storedName = `${randomUUID()}${extension}`;
  const filePath = path.join(UPLOAD_ROOT, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    fileName: file.name,
    filePath: path.join("uploads", storedName),
    mimeType: file.type,
  };
}

export function resolveUploadPath(storedRelativePath: string) {
  return path.join(/* turbopackIgnore: true */ process.cwd(), storedRelativePath);
}
