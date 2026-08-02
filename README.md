# Student Management System — Registry Module

A focused implementation of the four workflows a Registry Administrator uses
day to day: student enrolment, fees & payments, assessment submission, and
marksheet & results. Built with Next.js 16 (App Router), PostgreSQL, and
Prisma 7.

> See [`TaskCompleted.md`](./TaskCompleted.md) for a requirement-by-requirement
> checklist against the original brief.

## Stack

- **Next.js 16** (App Router, Route Handlers as the API layer)
- **PostgreSQL** via **Prisma 7** (`prisma-client` generator + `@prisma/adapter-pg`)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- No auth library — a cookie-based role/identity switcher stands in for login
  (see [Roles](#roles--no-auth) below)
- **Dark mode only, by design** — the app forces `dark` on `<html>` rather
  than following system preference or offering a toggle, so the intended
  look (glass-panel cards over a soft gradient backdrop, teal accent) is
  what actually renders, not whatever theme a reviewer's OS happens to be
  in. There's no light-mode toggle to find because there isn't one.

## Prerequisites

- Node.js 20+
- Docker Desktop (for the local Postgres container)

## Running it locally

```bash
# 1. Install dependencies
npm install

# 2. Copy the env file (defaults match docker-compose.yml)
cp .env.example .env

# 3. Start Postgres in Docker
docker compose up -d

# 4. Apply the schema
npx prisma migrate dev

# 5. Seed demo data (2 programmes, 6 students, payments, assessments,
#    submissions, and grades — see prisma/seed.ts)
npx prisma db seed

# 6. Run the app
npm run dev
```

Open <http://localhost:3000>.

### .env variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. `.env.example` points at the bundled `docker-compose.yml` service on `localhost:55432` (a non-default port, chosen so it doesn't clash with any other Postgres already running on your machine — natively or in another project's container). |

Uploaded submission files are written to a project-root `uploads/` folder
(gitignored) — this is a local-disk implementation, appropriate for running
the app locally as asked, but wouldn't survive on a stateless/serverless
deploy target without swapping in object storage.

## Roles & "auth"

There's no login. A `sms_role` cookie (`staff` | `student`) plus, in student
mode, an `sms_student_id` cookie ("logged in as") gate the two views. Use the
role switcher in the top-right of the header to flip roles and, as a student,
pick which seeded student you are. This matches the brief's "auth optional –
a simple role toggle is fine."

## Architecture

Code is organised by feature/domain rather than by technical layer:

```
src/
  app/                  routes: pages + API route handlers (thin — call into features/)
  features/
    enrolment/          Student + Programme (create, search/filter, ID generation)
    fees/               Payment (record, outstanding balance, overdue logic)
    assessments/        Assessment + Submission (create, upload, late flag, resubmission)
    results/            Grade (entry, classification, publish/withhold)
  components/           shared chrome (header, role switcher) + shadcn/ui primitives
  lib/                  Prisma client, session/cookie helpers, upload helper
  generated/prisma/     generated Prisma Client (not hand-edited)
```

Each feature owns its own `service.ts` (the only place that touches
`prisma.<model>` for that domain) and `validation.ts`. Route Handlers and
Server Components stay thin wrappers around those services, so the business
rules for each of the four workflows — fee/overdue math, late-submission
handling, grade classification — live in one place each.

### Data model

`Programme` → `Student` → `Payment` / `Submission` / `Grade`, with
`Assessment` → `Submission` / `Grade`. See `prisma/schema.prisma` for the full
schema. Notable modelling decisions:

- **Outstanding balance** (`programme.feeAmount − Σ payments.amount`) and
  **overdue** (`outstanding > 0 AND now() > feeDueDate`) are computed on read,
  not stored, so they're always consistent with the ledger.
- **Student ID** (`SMS-{year}-{seq}`) is generated server-side from a count of
  existing IDs sharing that year's prefix.
- **Submission** has a `@@unique([assessmentId, studentId])` constraint —
  resubmission is an upsert on that key. A first submission is always
  accepted and flagged `isLate` if past the deadline; a second submission
  attempt is only accepted while still before the deadline (this is the
  "late submissions are accepted, but resubmission closes at the deadline"
  distinction in the brief).
- **Grade** classification (Fail / Pass ≥ 40 / Merit ≥ 60 / Distinction ≥ 70)
  is computed server-side whenever a score is entered, and `published` is a
  separate flag staff toggle independently — students only ever see grades
  where `published = true`.

## Edge cases handled

- Overdue is **balance-aware**, not just date-aware: a student whose due date
  has passed but who has since paid in full is not flagged overdue (see
  Carol/Frank in the seed data); a student who hasn't reached their due date
  yet isn't flagged even with an outstanding balance (see Bob).
- Late submissions are accepted and visually flagged, but once a submission
  exists, resubmission is blocked after the deadline (seed data: Bob's
  Coursework 1 submission can no longer be replaced).
- File uploads are validated by both extension and MIME type (PDF/DOC/DOCX
  only) before touching disk.
- A student who withdraws mid-programme (Eve, in the seed data) can still
  have an outstanding/overdue balance and simply never submits — the system
  doesn't assume every student completes every workflow.
- Duplicate unique fields (email, programme code, payment reference number)
  return a friendly 409 rather than a raw database error.
- The submissions route (`/api/assessments/[id]/submissions`) reads the
  acting student from the session cookie server-side rather than trusting a
  client-supplied `studentId`, so a student can't submit work as someone else.

## AI usage

I used Claude Code as an assistant throughout the development process while maintaining ownership of all technical decisions and implementation:

- **Problem discovery:** Analyzed the assessment requirements independently, then used Claude Code to validate my understanding of the task constraints and success criteria
- **Requirement Analysis:** Extracted and prioritized functional/non-functional requirements myself, leveraging Claude to cross-reference against best practices and identify potential edge cases I might have missed
- **Planning before building:** Designed the overall solution architecture and tech stack selection based on my evaluation of the requirements, using Claude to review my approach and suggest alternative patterns where applicable
- **System Modeling:** Created the domain models and database schema myself, consulting Claude to validate relationship cardinalities and discuss normalization trade-offs
- **Architectural Design:** Made key architectural decisions (feature-based modules, src/ structure, Prisma ORM), using Claude to generate boilerplate and accelerate setup tasks while I focused on business logic
- **Implementation:** Wrote core business logic and features myself, using Claude to handle repetitive code generation, catch syntax errors, and suggest improvements to code quality
- **Testing:** Designed test scenarios and validation criteria independently, leveraging Claude to help write test fixtures and identify additional edge cases for comprehensive coverage

