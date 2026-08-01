import type { Assessment, Submission } from "@/generated/prisma/client";

export type { Assessment, Submission };

export type CreateAssessmentInput = {
  title: string;
  module: string;
  deadline: string;
};
