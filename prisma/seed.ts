import "dotenv/config";
import { prisma } from "../src/lib/db";
import { createProgramme, createStudent } from "../src/features/enrolment/service";
import { recordPayment } from "../src/features/fees/service";
import { createAssessment, submitAssessment } from "../src/features/assessments/service";
import { enterGrade, setGradePublished } from "../src/features/results/service";
import { saveSubmissionFile } from "../src/lib/uploads";

function daysFrom(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

function makeFile(name: string, type: string) {
  return new File([`Demo submission content for ${name}`], name, { type });
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.programme.deleteMany();

  console.log("Creating programmes...");
  const cs = await createProgramme({ name: "BSc Computer Science", code: "CS101", feeAmount: 5000 });
  const bm = await createProgramme({ name: "BA Business Management", code: "BM101", feeAmount: 4500 });

  console.log("Enrolling students...");
  const alice = await createStudent({
    fullName: "Alice Johnson",
    email: "alice.johnson@example.com",
    dob: "2001-04-12",
    programmeId: cs.id,
    academicYear: 2025,
    feeDueDate: daysFrom(-30), // overdue: unpaid, due date in the past
  });

  const bob = await createStudent({
    fullName: "Bob Smith",
    email: "bob.smith@example.com",
    dob: "2000-09-23",
    programmeId: cs.id,
    academicYear: 2025,
    feeDueDate: daysFrom(30), // partially paid, not yet due
  });

  const carol = await createStudent({
    fullName: "Carol Davis",
    email: "carol.davis@example.com",
    dob: "2002-01-05",
    programmeId: bm.id,
    academicYear: 2025,
    feeDueDate: daysFrom(-10), // fully paid, so not overdue despite date passing
  });

  await createStudent({
    fullName: "David Wilson",
    email: "david.wilson@example.com",
    dob: "1999-11-30",
    programmeId: bm.id,
    academicYear: 2025,
    status: "DEFERRED",
    feeDueDate: daysFrom(60),
  });

  await createStudent({
    fullName: "Eve Brown",
    email: "eve.brown@example.com",
    dob: "2001-07-18",
    programmeId: cs.id,
    academicYear: 2025,
    status: "WITHDRAWN",
    feeDueDate: daysFrom(-20), // overdue, withdrawn, never submitted anything
  });

  const frank = await createStudent({
    fullName: "Frank Miller",
    email: "frank.miller@example.com",
    dob: "1998-03-02",
    programmeId: bm.id,
    academicYear: 2024,
    status: "COMPLETED",
    feeDueDate: daysFrom(-90),
  });

  console.log("Recording payments...");
  await recordPayment({ studentId: bob.id, amount: 2000, paidAt: daysFrom(-5), referenceNumber: "TXN-1001" });
  await recordPayment({ studentId: carol.id, amount: 4500, paidAt: daysFrom(-20), referenceNumber: "TXN-1002" });
  await recordPayment({ studentId: frank.id, amount: 4500, paidAt: daysFrom(-95), referenceNumber: "TXN-1003" });

  console.log("Creating assessments...");
  const coursework1 = await createAssessment({
    title: "Coursework 1",
    module: "Databases",
    deadline: daysFrom(-5), // already closed - exercises late flagging + closed resubmission
  });
  const coursework2 = await createAssessment({
    title: "Coursework 2",
    module: "Databases",
    deadline: daysFrom(10), // still open
  });
  const essay1 = await createAssessment({
    title: "Essay 1",
    module: "Business Ethics",
    deadline: daysFrom(3), // still open
  });

  console.log("Submitting work...");
  // Bob submitted Coursework 1 on time, before the deadline.
  const bobFile = await saveSubmissionFile(makeFile("bob-coursework1.pdf", "application/pdf"));
  await prisma.submission.create({
    data: {
      assessmentId: coursework1.id,
      studentId: bob.id,
      fileName: bobFile.fileName,
      filePath: bobFile.filePath,
      mimeType: bobFile.mimeType,
      isLate: false,
      submittedAt: daysFrom(-6),
    },
  });
  // Alice submitted Coursework 1 after the deadline - flagged late but still accepted.
  const aliceFile = await saveSubmissionFile(
    makeFile("alice-coursework1.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
  );
  await prisma.submission.create({
    data: {
      assessmentId: coursework1.id,
      studentId: alice.id,
      fileName: aliceFile.fileName,
      filePath: aliceFile.filePath,
      mimeType: aliceFile.mimeType,
      isLate: true,
      submittedAt: daysFrom(-3),
    },
  });
  // Bob has already submitted Coursework 2 (still open, could resubmit before its deadline).
  await submitAssessment(coursework2.id, bob.id, makeFile("bob-coursework2.pdf", "application/pdf"));
  // Carol submitted Essay 1 (still open).
  await submitAssessment(essay1.id, carol.id, makeFile("carol-essay1.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
  // Eve (withdrawn) never submitted anything for Coursework 1 - intentional gap.

  console.log("Entering grades...");
  const aliceGrade = await enterGrade({ assessmentId: coursework1.id, studentId: alice.id, score: 35 });
  await setGradePublished(aliceGrade.id, true); // published FAIL

  const bobGrade = await enterGrade({ assessmentId: coursework1.id, studentId: bob.id, score: 72 });
  await setGradePublished(bobGrade.id, true); // published DISTINCTION

  await enterGrade({ assessmentId: coursework2.id, studentId: bob.id, score: 65 }); // MERIT, left withheld

  await enterGrade({ assessmentId: essay1.id, studentId: carol.id, score: 48 }); // PASS, left withheld

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
