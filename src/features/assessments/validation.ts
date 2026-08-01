import type { CreateAssessmentInput } from "./types";

export class ValidationError extends Error {}

export function parseCreateAssessmentInput(body: unknown): CreateAssessmentInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;

  const title = String(b.title ?? "").trim();
  if (!title) throw new ValidationError("Title is required.");

  const module_ = String(b.module ?? "").trim();
  if (!module_) throw new ValidationError("Module is required.");

  const deadline = String(b.deadline ?? "");
  if (Number.isNaN(Date.parse(deadline))) throw new ValidationError("A valid deadline is required.");

  return { title, module: module_, deadline };
}
