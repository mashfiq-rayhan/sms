import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { listPayments, recordPayment } from "@/features/fees/service";
import { parseCreatePaymentInput } from "@/features/fees/validation";

export async function GET() {
  const payments = await listPayments();
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseCreatePaymentInput(body);
    const payment = await recordPayment(input);
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
