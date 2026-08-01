import { prisma } from "@/lib/db";
import type { Programme, Student } from "@/generated/prisma/client";
import type { CreatePaymentInput, StudentBalance } from "./types";

type StudentWithProgrammeAndPayments = Student & {
  programme: Programme;
  payments: { amount: unknown }[];
};

export function computeBalance(student: StudentWithProgrammeAndPayments): StudentBalance {
  const feeAmount = Number(student.programme.feeAmount);
  const totalPaid = student.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = Math.max(0, feeAmount - totalPaid);
  const overdue = outstanding > 0 && new Date() > student.feeDueDate;

  return { student, feeAmount, totalPaid, outstanding, overdue };
}

export async function listBalances(): Promise<StudentBalance[]> {
  const students = await prisma.student.findMany({
    include: { programme: true, payments: true },
    orderBy: { createdAt: "desc" },
  });
  return students.map(computeBalance);
}

export async function getStudentBalance(studentId: string): Promise<StudentBalance | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { programme: true, payments: true },
  });
  if (!student) return null;
  return computeBalance(student);
}

export async function listOverdueBalances(): Promise<StudentBalance[]> {
  const balances = await listBalances();
  return balances.filter((b) => b.overdue);
}

export function listPayments() {
  return prisma.payment.findMany({
    include: { student: { include: { programme: true } } },
    orderBy: { paidAt: "desc" },
  });
}

export function recordPayment(input: CreatePaymentInput) {
  return prisma.payment.create({
    data: {
      studentId: input.studentId,
      amount: input.amount,
      paidAt: new Date(input.paidAt),
      referenceNumber: input.referenceNumber,
    },
    include: { student: true },
  });
}
