## 📋 TECHNICAL ASSESSMENT — ✅ Completed

### 🎓 Student Management System - Registry Module

- 💻 **Tech Stack:** Next.js (App Router) · PostgreSQL · Prisma ORM
- 📤 **Submission:** GitHub repository + README
- ⏳ **Time Allowed:** Within 7 working days
- 🤖 **AI Usage:** Encouraged - document what you used and how

> **Status:** All four workflows, the submission checklist, and the stack constraints below are implemented and verified (build, lint, and end-to-end `curl` testing against the seeded database — see `README.md`).

## 🔍 Overview

Build a focused web application covering the core Registry function of a student management system. You are not building a full platform - you are building the four workflows a Registry Administrator uses every day.

We care more about how you think than how much you build. Make deliberate product decisions, handle edge cases, and document your reasoning. Use AI tools freely - but own the output.

## 🛠️ What to Build

### 1. 👤 Student Enrolment ✅

The Registry team needs to add and manage student records.

- 📝 Create a student record: full name, email, date of birth, programme, academic year, and enrolment status.  
  ✅ `src/features/enrolment/service.ts` (`createStudent`), form in `new-student-dialog.tsx`, API at `POST /api/students`.
- 🆔 Auto-generate a unique Student ID (e.g. SMS-2025-0001).  
  ✅ `generateStudentId()` — counts existing IDs sharing the intake year's prefix and pads the next sequence (`SMS-{year}-{0001}`).
- 🏷️ Enrolment statuses: Enrolled, Deferred, Withdrawn, Completed.  
  ✅ Prisma enum `EnrolmentStatus` (`prisma/schema.prisma`), editable per-student in `student-edit-form.tsx`.
- 🔍 Search and filter students by name, ID, programme, or status.  
  ✅ `listStudents()` with `search`/`programmeId`/`status` filters, wired to URL query params in `students/page.tsx` + `student-filters.tsx`.

### 2. 💳 Fees & Payments ✅

The Registry needs to track what each student owes and what they have paid.

- 💰 Assign a fee amount to each student based on their programme.  
  ✅ `Programme.feeAmount`; every student inherits their fee via the `programme` relation.
- 🧾 Record payment transactions: amount, date, and reference number.  
  ✅ `Payment` model, `recordPayment()`, `record-payment-dialog.tsx`, API at `POST /api/payments`. Duplicate reference numbers are rejected (unique constraint → friendly 409).
- 📈 Show outstanding balance in real time.  
  ✅ `computeBalance()` computes `feeAmount − Σ payments` **on every read** (never stored/cached), so it's always correct after a new payment.
- ⚠️ Flag students with an overdue balance on the Registry dashboard.  
  ✅ Dashboard shows an overdue count + list (`listOverdueBalances()`). Overdue is **balance-aware**: a student who's paid in full is never flagged even past their due date, and a student who hasn't reached their due date isn't flagged even with a balance outstanding.

### 3. 📝 Assessment Submission ✅

Students submit work against assessments created by staff.

- 📅 Staff creates an assessment: title, module, and submission deadline.  
  ✅ `Assessment` model, `createAssessment()`, `new-assessment-dialog.tsx`, API at `POST /api/assessments`.
- 📄 Students upload a file (PDF or DOCX) against an open assessment.  
  ✅ `submitAssessment()` + `saveSubmissionFile()` (`src/lib/uploads.ts`) — validated by **both** file extension and MIME type before touching disk; rejects anything else with a 400.
- 🔄 One submission per student per assessment; allow resubmission before the deadline.  
  ✅ `@@unique([assessmentId, studentId])` on `Submission`; resubmission is an upsert on that key, allowed only while `now() <= deadline`.
- 🚨 Late submissions are accepted but visually flagged.  
  ✅ `isLate` is computed at submit time; a **first** submission is always accepted (even late) and flagged with a `Late` badge — but once a submission exists, a **second** attempt is blocked after the deadline (`ResubmissionClosedError`, 409). This distinction — late accepted vs. resubmission closed — was a deliberate edge-case call, not spelled out verbatim in the brief.

### 4. 📊 Marksheet & Results ✅

Staff enter grades; students see results only when published.

- 🔢 Staff enter a numeric grade (0–100) per student per assessment.  
  ✅ `Grade` model, `enterGrade()` (validates integer 0–100), entry UI on the assessment detail page (`assessments/[id]/page.tsx`).
- 🏅 Apply a simple classification: Pass ≥ 40, Merit ≥ 60, Distinction ≥ 70.  
  ✅ `computeClassification()` (`src/features/results/service.ts`) — recomputed server-side on every grade entry, never trusted from the client.
- 🔓 Staff can publish or withhold results per student.  
  ✅ `published` boolean on `Grade`, toggled independently of the score via `setGradePublished()` (`PATCH /api/grades/[id]/publish`).
- 👁️ Students see their marksheet only after it has been published.  
  ✅ `listGradesForStudent(id, { onlyPublished: true })` is the **only** query the student-facing `/results` page uses — verified end-to-end (withheld grade invisible → publish → appears → withhold again → disappears).

## 📦 What to Submit

- 📁 A GitHub repository with all code committed (no zip files).  
  ✅ Pushed to `https://github.com/mashfiq-rayhan/sms`.
- 📖 A README covering: how to run it locally, your .env variables, and a short section on how you used AI during the build.
  ✅ See `README.md` — local setup (Docker Postgres → migrate → seed → dev), `.env` variables table, and a detailed AI-usage section.
- 🌱 A seed script that loads demo data: at least 5 students, 2 programmes, fees, and sample grades.  
  ✅ `prisma/seed.ts` — 2 programmes, 6 students (all four enrolment statuses represented), 3 payments (one overdue case, one fully-paid-past-due case, one not-yet-due case), 3 assessments (one already past its deadline), 4 submissions (one on time, one late), 4 grades spanning Fail/Pass/Merit/Distinction with a mix of published/withheld.
- 👥 Basic role separation: a Staff view and a Student view (auth optional – a simple role toggle is fine).  
  ✅ Cookie-based role + "acting student" switcher in the header (no auth library) — see `src/lib/session.ts` and `role-switcher.tsx`.

## 🎯 How We Will Assess It

We are looking for four things:

| Dimension | Weight | Evidence |
|---|---|---|
| Stakeholder understanding – does your data model and UI reflect how a Registry team actually works? | 30% | Balance computed live rather than cached; a Student→Programme→(Payments/Submissions/Grades) schema that mirrors how a registrar actually thinks about a record; staff/student views scoped to what each role needs to see. |
| Feature intuition – did you handle edge cases (overdue fees, late submissions, withheld results) without being told to? | 30% | Balance-aware overdue (not just date-based); late-accepted-but-resubmission-closed distinction; withdrawn students can still carry a balance and simply never submit; duplicate unique fields return friendly errors, not raw DB errors. |
| Technical quality – clean schema, working API routes, basic error handling. | 25% | Feature-based module architecture (`src/features/<domain>/{service,validation,components}`) — route handlers are thin wrappers around one service per domain; every mutation route validates input and maps known errors (validation, Prisma unique-constraint, upload, deadline) to appropriate HTTP status codes. |
| AI usage – did you use AI effectively, and can you articulate how in your README? | 15% | See `README.md` → **AI usage**: problem discovery (Next.js 16 / Prisma 7 breaking-change research), plan-first workflow with two explicit corrections, real end-to-end verification instead of trusting the type-checker, and two concrete bugs it caught by reading its own server logs. |

## ⚙️ Stack & Constraints

- ⚡ Next.js with App Router – required.  
  ✅ Next.js 16.2.12, App Router throughout (no Pages Router).
- 🗄️ PostgreSQL with Prisma – required. Commit your schema.prisma.  
  ✅ PostgreSQL via `@prisma/adapter-pg` (Prisma 7's driver-adapter model); `prisma/schema.prisma` and `prisma/migrations/` are committed.
- 🎨 Styling: Tailwind or any component library (Shadcn UI preferred)  
  ✅ Tailwind CSS v4 + shadcn/ui (Base UI primitives).
- 🚫 Do not use a different backend framework.  
  ✅ No Express/Fastify/etc. — all server logic is Next.js Route Handlers.
- 💾 Do not mock data in useState - a real database is required.  
  ✅ Every page reads from Postgres via Prisma; no client-side mock/seed state anywhere.
- 🔒 Use a .env example file; never commit credentials.  
  ✅ `.env.example` committed; `.env` itself is gitignored (`.env*` with a `!.env.example` exception) and was never tracked.

✨ Good luck — we look forward to seeing how you think.
