import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "staff" | "student";

const ROLE_COOKIE = "sms_role";
const STUDENT_COOKIE = "sms_student_id";

export async function getSession() {
  const store = await cookies();
  const role: Role = store.get(ROLE_COOKIE)?.value === "student" ? "student" : "staff";
  const studentId = store.get(STUDENT_COOKIE)?.value ?? null;
  return { role, studentId };
}

export async function setRole(role: Role) {
  const store = await cookies();
  store.set(ROLE_COOKIE, role, { path: "/", sameSite: "lax" });
}

export async function setActingStudent(studentId: string) {
  const store = await cookies();
  store.set(STUDENT_COOKIE, studentId, { path: "/", sameSite: "lax" });
}

export async function requireStaff() {
  const session = await getSession();
  if (session.role !== "staff") redirect("/");
  return session;
}

export async function requireActingStudent() {
  const session = await getSession();
  if (session.role !== "student" || !session.studentId) redirect("/");
  return session as { role: "student"; studentId: string };
}
