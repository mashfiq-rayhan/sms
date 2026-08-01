import { prisma } from "@/lib/db";
import { EnrolmentStatus } from "@/generated/prisma/client";
import type {
  CreateProgrammeInput,
  CreateStudentInput,
  StudentFilters,
  UpdateStudentInput,
} from "./types";

async function generateStudentId(academicYear: number) {
  const prefix = `SMS-${academicYear}-`;
  const count = await prisma.student.count({
    where: { studentId: { startsWith: prefix } },
  });
  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
}

export function listStudentsBasic() {
  return prisma.student.findMany({
    select: { id: true, studentId: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
}

export function listProgrammes() {
  return prisma.programme.findMany({ orderBy: { name: "asc" } });
}

export function listProgrammeOptions() {
  return prisma.programme.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
}

export function createProgramme(input: CreateProgrammeInput) {
  return prisma.programme.create({
    data: { name: input.name, code: input.code, feeAmount: input.feeAmount },
  });
}

export function listStudents(filters: StudentFilters) {
  return prisma.student.findMany({
    where: {
      status: filters.status,
      programmeId: filters.programmeId || undefined,
      ...(filters.search
        ? {
            OR: [
              { fullName: { contains: filters.search, mode: "insensitive" } },
              { studentId: { contains: filters.search, mode: "insensitive" } },
              { email: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { programme: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      programme: true,
      payments: { orderBy: { paidAt: "desc" } },
      submissions: { include: { assessment: true }, orderBy: { submittedAt: "desc" } },
      grades: { include: { assessment: true }, orderBy: { gradedAt: "desc" } },
    },
  });
}

export async function createStudent(input: CreateStudentInput) {
  const studentId = await generateStudentId(input.academicYear);
  return prisma.student.create({
    data: {
      studentId,
      fullName: input.fullName,
      email: input.email,
      dob: new Date(input.dob),
      programmeId: input.programmeId,
      academicYear: input.academicYear,
      status: input.status ?? EnrolmentStatus.ENROLLED,
      feeDueDate: new Date(input.feeDueDate),
    },
    include: { programme: true },
  });
}

export function updateStudent(id: string, input: UpdateStudentInput) {
  return prisma.student.update({
    where: { id },
    data: {
      fullName: input.fullName,
      email: input.email,
      dob: input.dob ? new Date(input.dob) : undefined,
      programmeId: input.programmeId,
      academicYear: input.academicYear,
      status: input.status,
      feeDueDate: input.feeDueDate ? new Date(input.feeDueDate) : undefined,
    },
    include: { programme: true },
  });
}
