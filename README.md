# eduInUK Triage

AI-assisted student support triage system. Students submit requests, the system classifies and routes them. Staff see escalated cases in a dashboard and manage them through to resolution.

Live: https://eduinuk-triage.vercel.app

---

## Local Setup

**Requirements:** Node.js 18+, a PostgreSQL database (Neon or Supabase free tier works), an OpenAI-compatible API key.

```bash
git clone <your-repo-url>
cd eduinuk-triage
npm install
```

Create `.env.local` in the project root:

```env
# GitHub Models Azure Inference endpoint
AI_BASE_URL="https://models.inference.ai.azure.com"

# Paste your GitHub Personal Access Token (PAT) here for local testing
AI_API_KEY=""

# Configurable model name
AI_MODEL="gpt-4o-mini"

# Local Next.js server port
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"


# Connect to Postgres via the shared transaction-mode pooler (IPv4-only)
DATABASE_URL="supabase://postgres:password@localhost/postgres"

# Connect to Postgres via the shared session-mode pooler (used for migrations)
DIRECT_URL="supabase_direct://postgres:password@localhost/postgres"
```

Run migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the dev server:

```bash
npm run dev
```

App runs at http://localhost:3000.

---

## How It Works

Four stages. Nothing hits the database until all four complete.

**Stage 1 — Pre-checks (no AI)**
The message is scanned with regex before the AI is called. Immediate danger signals (suicidal language, self-harm, threats to safety) and prompt injection attempts short-circuit the pipeline. AI is never called. A hardcoded safe response is saved and the case escalates at critical priority. Safety rules hold even if the AI is down.

**Stage 2 — AI triage**
If no pre-check fires, the message goes to the AI. Temperature 0, JSON mode enforced. The AI returns category, urgency, safeguarding flag, disposition, and a generated reply. If the call fails or times out, the system falls back to a safe escalation. The student never sees an error.

**Stage 3 — Zod validation**
The AI's JSON is validated against a strict schema. Wrong type, missing field, invalid enum value — any of these triggers the fallback escalation. The app never trusts raw AI output.

**Stage 4 — Post-checks (final authority)**
A set of hard rules runs after validation regardless of what the AI decided. High or critical urgency cases cannot be handle_now. Safeguarding cases cannot be discarded. Emergency cases always get 999 and Samaritans in the student reply. The AI's output is a suggestion. Post-checks are the authority.

---

## What Gets Built

- **Student intake form** at `/submit` with name, email, university, course, year, and message
- **Inline triage response** shown immediately after submission
- **Staff dashboard** at `/dashboard` with filters by status, urgency, category, and safeguarding flag
- **Case detail page** with full audit trail: AI reasoning, pre-check status, post-check overrides, raw LLM response
- **Case management** panel for updating status, assigning an advisor, and recording internal notes

---

## Tech Stack

Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL (supabase), Shadcn/ui, Tailwind CSS, Vercel.

---

## Notes on the Submission

The student reply is intentionally thin in some cases. The system prioritises accuracy over verbosity. A short reply that stays within the resource library is better than a long one that invents details.

Discard is used only for clear spam and advertising. Vague messages ("need help asap") go to clarify, not discard. That distinction is enforced in both the prompt and the post-checks.

Case status is always set manually by staff. The AI never marks a case resolved. handle_now means the AI generated a reply to send to the student. The case still sits in the queue at `new` until a staff member reviews and moves it.

---

## Three Questions

**If this served 50 organisations and 10,000 requests a day, what in your design would you change?**

The AI call is synchronous right now. At volume, that becomes a problem fast. The first change would be to make triage async: accept the submission immediately, queue the AI call via a job processor (something like Inngest or BullMQ), and return the result to the student via polling or websocket. The database schema would need a multi-tenant `organisationId` on every table so each org sees only its own cases. Rate limiting per organisation on the intake form would prevent abuse from spiking AI costs.

**This is real students' personal and welfare data. What would you do differently for privacy and safety in a production version?**

Several things. The raw LLM response is stored in full right now, which includes the student's message passed back through the AI. In production I'd strip the student message from rawLlmResponse before storage and keep only the structured output. The staff dashboard has no authentication in this build. Production needs proper auth with role-based access so only authorised staff can see case details, and definitely not the AI reasoning or override logs which are internal audit data. The database uses Supabase with PgBouncer connection pooling already in place. In production I'd add short-lived credentials via a secrets manager so a leaked connection string expires automatically rather than giving permanent access. I'd also add a data retention policy so cases are purged after a defined period, and an audit log separate from the case record tracking every status change and data access by staff.

**In two or three sentences a non-technical colleague would understand, explain how your tool decides what to escalate.**

The tool reads each student message and checks it against a set of rules in a fixed order. Safety always comes first: anything that sounds like a mental health crisis, a risk to someone's safety, or a visa problem goes straight to a human, no matter what. For everything else, if the tool can find a clear answer in its approved list of resources it replies directly; if it cannot, or if it is not sure, it sends the case to the queue rather than guess.