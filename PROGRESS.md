# SkillMatch – Progress

## Phase 1 – Scaffold ✅

**Status:** Complete

### Done
- Vite + React + TypeScript project structure
- Tailwind CSS + PostCSS configured with custom brand palette
- `@/` path aliases in TypeScript + Vite
- Supabase client (`src/lib/supabase.ts`) with typed Database interface
- TanStack Query client (`src/lib/queryClient.ts`)
- Auth context + hook (`src/hooks/useAuth.tsx`) — session, profile, role, signOut
- Protected routes by role (`src/features/auth/ProtectedRoute.tsx`)
- Full routing: Landing, Login, Signup, Candidate dashboard, Recruiter dashboard
- Layout components (sidebar + mobile menu) for both roles
- Shared UI components: Loading, Empty, ErrorDisplay, ScoreBadge, ProgressBar
- Landing page with hero, stats, features, CTA
- Login + Signup pages with zod validation
- Stub dashboard pages (to be filled in Phases 3–6)
- `.env.example` (no secrets committed)
- `.gitignore`
- `README.md` with setup, architecture, deploy instructions
- All TypeScript types for DB tables + RPC return types

### Known Issues / Notes
- Node.js was not installed; installed via winget during Phase 1
- `npm install` + build test to run once Node.js MSI completes

---

## Phase 2 – Database Migrations + RLS + Seed ⏳

**Status:** Pending

### Next
- Write SQL migrations in `/supabase/migrations/`
- Tables: profiles, skills, skill_relations, candidate_skills, jobs, job_skills, applications, saved_jobs
- RLS policies for all tables
- Trigger: auto-create profile on auth.users insert
- Seed 150+ skills across categories
- Apply via `supabase db push`

---

## Phase 3 – Candidate Flow ⏳
## Phase 4 – Recruiter Flow ⏳
## Phase 5 – Matching Engine ⏳
## Phase 6 – Applications & Saved Jobs ⏳
## Phase 7 – Polish & Tests ⏳
## Phase 8 – Final README + Demo Seed ⏳
