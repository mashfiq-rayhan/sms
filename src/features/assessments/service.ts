import { prisma } from "@/lib/db";
import { InvalidUploadError, saveSubmissionFile } from "@/lib/uploads";
import type { CreateAssessmentInput } from "./types";

export class ResubmissionClosedError extends Error {}

export function listAssessments() {
  return prisma.assessment.findMany({ orderBy: { deadline: "asc" } });
}

export function getAssessmentById(id: string) {
  return prisma.assessment.findUnique({
    where: { id },
    include: { submissions: { include: { student: true }, orderBy: { submittedAt: "desc" } } },
  });
}

export function createAssessment(input: CreateAssessmentInput) {
  return prisma.assessment.create({
    data: { title: input.title, module: input.module, deadline: new Date(input.deadline) },
  });
}

export function listSubmissionsForStudent(studentId: string) {
  return prisma.submission.findMany({
    where: { studentId },
    include: { assessment: true },
    orderBy: { submittedAt: "desc" },
  });
}

export async function submitAssessment(assessmentId: string, studentId: string, file: File) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new Error("Assessment not found.");

  const existing = await prisma.submission.findUnique({
    where: { assessmentId_studentId: { assessmentId, studentId } },
  });

  const now = new Date();
  if (existing && now > assessment.deadline) {
    throw new ResubmissionClosedError("The deadline has passed; resubmission is no longer allowed.");
  }

  let saved;
  try {
    saved = await saveSubmissionFile(file);
  } catch (err) {
    if (err instanceof InvalidUploadError) throw err;
    throw err;
  }

  const isLate = now > assessment.deadline;

  return prisma.submission.upsert({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    create: {
      assessmentId,
      studentId,
      fileName: saved.fileName,
      filePath: saved.filePath,
      mimeType: saved.mimeType,
      isLate,
      submittedAt: now,
    },
    update: {
      fileName: saved.fileName,
      filePath: saved.filePath,
      mimeType: saved.mimeType,
      isLate,
      submittedAt: now,
    },
  });
}
