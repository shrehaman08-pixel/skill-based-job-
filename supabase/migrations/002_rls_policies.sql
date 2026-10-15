-- Migration 002: Row Level Security policies
-- All tables have RLS enabled.
-- Design principles:
--   • Active jobs + skills are publicly readable (job board behaviour)
--   • Candidates read/write only their own data
--   • Recruiters manage only their own jobs; see applicants to those jobs

-- ============================================================
-- Enable RLS on every table
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.skills          enable row level security;
alter table public.skill_relations enable row level security;
alter table public.candidate_skills enable row level security;
alter table public.jobs            enable row level security;
alter table public.job_skills      enable row level security;
alter table public.applications    enable row level security;
alter table public.saved_jobs      enable row level security;

-- ============================================================
-- profiles
-- ============================================================
-- Anyone authenticated can read profiles (needed for recruiter viewing applicants)
create policy "profiles: authenticated read"
  on public.profiles for select
  to authenticated
  using (true);

-- Users manage only their own profile
create policy "profiles: own insert"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: own update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- ============================================================
-- skills (public read)
-- ============================================================
create policy "skills: public read"
  on public.skills for select
  using (true);

-- Only admins may insert/update skills (or use service key in migrations)
create policy "skills: admin write"
  on public.skills for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- skill_relations (public read)
-- ============================================================
create policy "skill_relations: public read"
  on public.skill_relations for select
  using (true);

create policy "skill_relations: admin write"
  on public.skill_relations for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- candidate_skills
-- Candidates manage only their own. Recruiters can read (to see applicant skills).
-- ============================================================
create policy "candidate_skills: own read/write"
  on public.candidate_skills for all
  to authenticated
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

-- Recruiters can read skills of candidates who applied to their jobs
create policy "candidate_skills: recruiter read applicants"
  on public.candidate_skills for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.candidate_id = candidate_skills.candidate_id
        and j.recruiter_id = auth.uid()
    )
  );

-- ============================================================
-- jobs
-- Active jobs are publicly readable (job board).
-- Recruiters manage only their own jobs.
-- ============================================================
create policy "jobs: public read active"
  on public.jobs for select
  using (status = 'active' or recruiter_id = auth.uid());

create policy "jobs: recruiter insert"
  on public.jobs for insert
  to authenticated
  with check (
    recruiter_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'recruiter'
    )
  );

create policy "jobs: recruiter update own"
  on public.jobs for update
  to authenticated
  using (recruiter_id = auth.uid());

create policy "jobs: recruiter delete own"
  on public.jobs for delete
  to authenticated
  using (recruiter_id = auth.uid());

-- ============================================================
-- job_skills
-- Publicly readable (needed to compute match score client-side).
-- Recruiters can only modify their own job's skills.
-- ============================================================
create policy "job_skills: public read"
  on public.job_skills for select
  using (true);

create policy "job_skills: recruiter write own"
  on public.job_skills for all
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where id = job_skills.job_id and recruiter_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.jobs
      where id = job_skills.job_id and recruiter_id = auth.uid()
    )
  );

-- ============================================================
-- applications
-- Candidates see only their own applications.
-- Recruiters see applications to their own jobs.
-- ============================================================
create policy "applications: candidate own"
  on public.applications for all
  to authenticated
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());

create policy "applications: recruiter read own jobs"
  on public.applications for select
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

create policy "applications: recruiter update status"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.jobs
      where id = applications.job_id and recruiter_id = auth.uid()
    )
  );

-- ============================================================
-- saved_jobs
-- Candidates manage only their own saved jobs.
-- ============================================================
create policy "saved_jobs: candidate own"
  on public.saved_jobs for all
  to authenticated
  using (candidate_id = auth.uid())
  with check (candidate_id = auth.uid());
