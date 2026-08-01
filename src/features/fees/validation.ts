import type { CreatePaymentInput } from "./types";

export class ValidationError extends Error {}

export function parseCreatePaymentInput(body: unknown): CreatePaymentInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;

  const studentId = String(b.studentId ?? "").trim();
  if (!studentId) throw new ValidationError("Student is required.");

  const amount = Number(b.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("Payment amount must be a positive number.");
  }

  const paidAt = String(b.paidAt ?? "");
  if (Number.isNaN(Date.parse(paidAt))) throw new ValidationError("A valid payment date is required.");

  const referenceNumber = String(b.referenceNumber ?? "").trim();
  if (!referenceNumber) throw new ValidationError("A reference number is required.");

  return { studentId, amount, paidAt, referenceNumber };
}
