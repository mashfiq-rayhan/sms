import type { EnterGradeInput } from "./types";

export class ValidationError extends Error {}

export function parseEnterGradeInput(body: unknown): EnterGradeInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;

  const assessmentId = String(b.assessmentId ?? "").trim();
  if (!assessmentId) throw new ValidationError("Assessment is required.");

  const studentId = String(b.studentId ?? "").trim();
  if (!studentId) throw new ValidationError("Student is required.");

  const score = Number(b.score);
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new ValidationError("Score must be a whole number between 0 and 100.");
  }

  return { assessmentId, studentId, score };
}
