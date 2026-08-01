import { EnrolmentStatus } from "@/generated/prisma/client";
import type { CreateProgrammeInput, CreateStudentInput, UpdateStudentInput } from "./types";

export class ValidationError extends Error {}

const STATUS_VALUES = new Set<string>(Object.values(EnrolmentStatus));

export function parseCreateStudentInput(body: unknown): CreateStudentInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;

  const fullName = String(b.fullName ?? "").trim();
  if (!fullName) throw new ValidationError("Full name is required.");

  const email = String(b.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("A valid email is required.");
  }

  const dob = String(b.dob ?? "");
  if (Number.isNaN(Date.parse(dob))) throw new ValidationError("A valid date of birth is required.");

  const programmeId = String(b.programmeId ?? "").trim();
  if (!programmeId) throw new ValidationError("Programme is required.");

  const academicYear = Number(b.academicYear);
  if (!Number.isInteger(academicYear) || academicYear < 2000) {
    throw new ValidationError("A valid academic year is required.");
  }

  const feeDueDate = String(b.feeDueDate ?? "");
  if (Number.isNaN(Date.parse(feeDueDate))) {
    throw new ValidationError("A valid fee due date is required.");
  }

  let status: CreateStudentInput["status"];
  if (b.status !== undefined && b.status !== "") {
    if (!STATUS_VALUES.has(String(b.status))) throw new ValidationError("Invalid enrolment status.");
    status = b.status as CreateStudentInput["status"];
  }

  return { fullName, email, dob, programmeId, academicYear, feeDueDate, status };
}

export function parseUpdateStudentInput(body: unknown): UpdateStudentInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;
  const result: UpdateStudentInput = {};

  if (b.fullName !== undefined) {
    const fullName = String(b.fullName).trim();
    if (!fullName) throw new ValidationError("Full name cannot be empty.");
    result.fullName = fullName;
  }
  if (b.email !== undefined) {
    const email = String(b.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("A valid email is required.");
    result.email = email;
  }
  if (b.dob !== undefined) {
    if (Number.isNaN(Date.parse(String(b.dob)))) throw new ValidationError("A valid date of birth is required.");
    result.dob = String(b.dob);
  }
  if (b.programmeId !== undefined) {
    const programmeId = String(b.programmeId).trim();
    if (!programmeId) throw new ValidationError("Programme is required.");
    result.programmeId = programmeId;
  }
  if (b.academicYear !== undefined) {
    const academicYear = Number(b.academicYear);
    if (!Number.isInteger(academicYear) || academicYear < 2000) {
      throw new ValidationError("A valid academic year is required.");
    }
    result.academicYear = academicYear;
  }
  if (b.feeDueDate !== undefined) {
    if (Number.isNaN(Date.parse(String(b.feeDueDate)))) throw new ValidationError("A valid fee due date is required.");
    result.feeDueDate = String(b.feeDueDate);
  }
  if (b.status !== undefined) {
    if (!STATUS_VALUES.has(String(b.status))) throw new ValidationError("Invalid enrolment status.");
    result.status = b.status as UpdateStudentInput["status"];
  }

  return result;
}

export function parseCreateProgrammeInput(body: unknown): CreateProgrammeInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object.");
  }
  const b = body as Record<string, unknown>;

  const name = String(b.name ?? "").trim();
  if (!name) throw new ValidationError("Programme name is required.");

  const code = String(b.code ?? "").trim().toUpperCase();
  if (!code) throw new ValidationError("Programme code is required.");

  const feeAmount = Number(b.feeAmount);
  if (!Number.isFinite(feeAmount) || feeAmount < 0) {
    throw new ValidationError("A valid fee amount is required.");
  }

  return { name, code, feeAmount };
}
