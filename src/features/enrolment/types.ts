import type { EnrolmentStatus, Programme, Student } from "@/generated/prisma/client";

export type { EnrolmentStatus, Programme, Student };

export type StudentWithProgramme = Student & { programme: Programme };

// Client Components must not receive a full Programme (its feeAmount is a
// Prisma Decimal instance, which cannot cross the server/client boundary as
// a prop) — this lean shape is what forms/selects actually need.
export type ProgrammeOption = { id: string; name: string; code: string };

// Same reasoning as ProgrammeOption: getStudentById() returns a Student with
// nested programme/payments/submissions/grades (several holding Decimal
// fields). StudentEditForm only edits these plain fields, so callers must
// pass a stripped-down plain object rather than the full query result.
export type EditableStudent = {
  id: string;
  fullName: string;
  email: string;
  dob: Date;
  programmeId: string;
  academicYear: number;
  status: EnrolmentStatus;
  feeDueDate: Date;
};

export type StudentFilters = {
  search?: string;
  programmeId?: string;
  status?: EnrolmentStatus;
};

export type CreateStudentInput = {
  fullName: string;
  email: string;
  dob: string;
  programmeId: string;
  academicYear: number;
  status?: EnrolmentStatus;
  feeDueDate: string;
};

export type UpdateStudentInput = Partial<CreateStudentInput>;

export type CreateProgrammeInput = {
  name: string;
  code: string;
  feeAmount: number;
};
