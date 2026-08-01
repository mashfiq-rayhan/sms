import type { Classification, Grade } from "@/generated/prisma/client";

export type { Classification, Grade };

export type EnterGradeInput = {
  assessmentId: string;
  studentId: string;
  score: number;
};
