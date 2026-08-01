import { prisma } from "@/lib/db";
import { Classification } from "@/generated/prisma/client";
import type { EnterGradeInput } from "./types";

export function computeClassification(score: number): Classification {
  if (score >= 70) return Classification.DISTINCTION;
  if (score >= 60) return Classification.MERIT;
  if (score >= 40) return Classification.PASS;
  return Classification.FAIL;
}

export function enterGrade(input: EnterGradeInput) {
  const classification = computeClassification(input.score);
  return prisma.grade.upsert({
    where: { assessmentId_studentId: { assessmentId: input.assessmentId, studentId: input.studentId } },
    create: {
      assessmentId: input.assessmentId,
      studentId: input.studentId,
      score: input.score,
      classification,
      published: false,
    },
    update: {
      score: input.score,
      classification,
      gradedAt: new Date(),
    },
  });
}

export function setGradePublished(id: string, published: boolean) {
  return prisma.grade.update({ where: { id }, data: { published } });
}

export function listAllGrades() {
  return prisma.grade.findMany({
    include: { student: true, assessment: true },
    orderBy: { gradedAt: "desc" },
  });
}

export function listGradesForAssessment(assessmentId: string) {
  return prisma.grade.findMany({
    where: { assessmentId },
    include: { student: true },
    orderBy: { student: { fullName: "asc" } },
  });
}

export function listGradesForStudent(studentId: string, options: { onlyPublished?: boolean } = {}) {
  return prisma.grade.findMany({
    where: { studentId, published: options.onlyPublished ? true : undefined },
    include: { assessment: true },
    orderBy: { gradedAt: "desc" },
  });
}
