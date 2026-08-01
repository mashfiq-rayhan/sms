import type { Payment, Programme, Student } from "@/generated/prisma/client";

export type { Payment };

export type StudentBalance = {
  student: Student & { programme: Programme };
  feeAmount: number;
  totalPaid: number;
  outstanding: number;
  overdue: boolean;
};

export type CreatePaymentInput = {
  studentId: string;
  amount: number;
  paidAt: string;
  referenceNumber: string;
};
