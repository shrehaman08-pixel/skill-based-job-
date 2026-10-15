# SkillMatch

> A skill-based job matching platform — jobs matched by **skills**, not titles.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Data Fetching | TanStack Query v5 |
| Forms | react-hook-form + zod |
| Backend & DB | Supabase (Postgres + Auth + RLS) |
| Client | @supabase/supabase-js |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 2. Clone & Install

```bash
git clone <repo-url>
cd skillmatch
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Project → Settings → API**

### 4. Supabase Setup

Install the Supabase CLI:
```bash
npm install -g supabase
```

Link your project:
```bash
supabase login
supabase link --project-ref your-project-ref
```

Push migrations:
```bash
supabase db push
```

Seed data:
```bash
supabase db execute --file supabase/seed.sql
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
src/
├── components/     # Shared UI (layouts, loading, badges)
├── features/
│   ├── auth/       # Login, Signup, ProtectedRoute
│   ├── candidate/  # Profile, job feed, applications
│   └── recruiter/  # Job posting, candidate ranking
├── hooks/          # useAuth
├── lib/            # supabase client, queryClient
├── pages/          # Route-level page components
├── types/          # TypeScript types (database, RPC)
└── utils/          # Helpers (cn, formatSalary, etc.)

supabase/
├── migrations/     # Versioned SQL migrations (000_*.sql)
└── seed.sql        # 150+ skills + demo accounts
```

## Architecture

```
User ──► React App (Vite)
          │
          ├── React Router    (client-side routing)
          ├── TanStack Query  (server state + caching)
          ├── useAuth hook    (session + profile)
          │
          └── Supabase Client
                │
                ├── supabase.auth.*     (login, signup, session)
                ├── supabase.from(...)  (CRUD with RLS)
                └── supabase.rpc(...)   (matching engine)
                        │
                        └── Postgres
                              ├── Tables (profiles, skills, jobs, ...)
                              ├── RLS Policies
                              ├── Triggers (auto-create profile)
                              └── Functions (match_jobs_for_candidate, ...)
```

## Matching Engine

The score (0–100) is computed entirely in Postgres via RPC:

```
for each job_skill:
  credit = min(candidate_level / required_level, 1)
  if missing but has related skill:
    credit = similarity × 0.7 × credit_ratio

  weight = 2 if 'must', 1 if 'nice'

score = 100 × Σ(weight × credit) / Σ(weight)
penalty = 25% off if any 'must' skill has credit = 0
```

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy — Vercel handles Vite build automatically

## User Roles

| Role | Capabilities |
|---|---|
| **Candidate** | Build skill profile, see ranked job feed, apply, save jobs |
| **Recruiter** | Post skill-required jobs, see ranked candidates, manage applications |

## Demo Accounts (Phase 8)

After running `seed.sql`:

| Email | Password | Role |
|---|---|---|
| recruiter@demo.com | demo1234 | Recruiter |
| alice@demo.com | demo1234 | Candidate |
| bob@demo.com | demo1234 | Candidate |
| carol@demo.com | demo1234 | Candidate |
