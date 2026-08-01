import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export function errorResponse(err: unknown, fallbackStatus = 400) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const fields = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
    return NextResponse.json({ error: `A record with that ${fields} already exists.` }, { status: 409 });
  }
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: fallbackStatus });
  }
  return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
}
