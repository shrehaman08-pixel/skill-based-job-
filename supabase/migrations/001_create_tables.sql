-- Migration 001: Core tables
-- Run: supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- Linked 1:1 to auth.users via trigger on signup
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null check (role in ('candidate','recruiter','admin')),
  full_name       text,
  headline        text,
  location        text,
  years_experience int check (years_experience >= 0),
  created_at      timestamptz not null default now()
);

comment on table public.profiles is 'One profile per auth user, auto-created by trigger.';

-- ============================================================
-- skills
-- Master taxonomy, seeded via seed.sql
-- ============================================================
create table public.skills (
  id       uuid primary key default uuid_generate_v4(),
  name     text not null,
  category text not null,
  aliases  text[] not null default '{}',
  constraint skills_name_unique unique (name)
);

create index idx_skills_category on public.skills(category);
-- GIN index for fast alias search
create index idx_skills_aliases on public.skills using gin(aliases);

-- ============================================================
-- skill_relations
-- Soft adjacency between skills, e.g. React ~ Vue at 0.6
-- ============================================================
create table public.skill_relations (
  skill_id        uuid not null references public.skills(id) on delete cascade,
  related_skill_id uuid not null references public.skills(id) on delete cascade,
  similarity      numeric(3,2) not null check (similarity between 0 and 1),
  primary key (skill_id, related_skill_id),
  constraint no_self_relation check (skill_id <> related_skill_id)
);

create index idx_skill_relations_skill on public.skill_relations(skill_id);
create index idx_skill_relations_related on public.skill_relations(related_skill_id);

-- ============================================================
-- candidate_skills
-- Skills a candidate has, with proficiency (1-5) and years
-- ============================================================
create table public.candidate_skills (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  skill_id     uuid not null references public.skills(id) on delete cascade,
  proficiency  int not null check (proficiency between 1 and 5),
  years        numeric(4,1) check (years >= 0),
  primary key (candidate_id, skill_id)
);

create index idx_candidate_skills_candidate on public.candidate_skills(candidate_id);
create index idx_candidate_skills_skill on public.candidate_skills(skill_id);

-- ============================================================
-- jobs
-- Job postings by recruiters
-- ============================================================
create table public.jobs (
  id           uuid primary key default uuid_generate_v4(),
  recruiter_id uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  company      text not null,
  description  text,
  location     text,
  work_mode    text not null default 'hybrid' check (work_mode in ('remote','hybrid','onsite')),
  salary_min   int check (salary_min >= 0),
  salary_max   int check (salary_max >= 0),
  status       text not null default 'active' check (status in ('draft','active','closed')),
  created_at   timestamptz not null default now(),
  constraint salary_order check (salary_max is null or salary_min is null or salary_max >= salary_min)
);

create index idx_jobs_recruiter on public.jobs(recruiter_id);
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_created on public.jobs(created_at desc);

-- ============================================================
-- job_skills
-- Skills required for a job, with importance and weight
-- ============================================================
create table public.job_skills (
  job_id         uuid not null references public.jobs(id) on delete cascade,
  skill_id       uuid not null references public.skills(id) on delete cascade,
  required_level int not null check (required_level between 1 and 5),
  importance     text not null default 'must' check (importance in ('must','nice')),
  weight         numeric(4,2) not null default 1.0 check (weight > 0),
  primary key (job_id, skill_id)
);

create index idx_job_skills_job on public.job_skills(job_id);
create index idx_job_skills_skill on public.job_skills(skill_id);

-- ============================================================
-- applications
-- Candidate applications to jobs; unique per candidate+job
-- ============================================================
create table public.applications (
  id            uuid primary key default uuid_generate_v4(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  candidate_id  uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'applied'
                  check (status in ('applied','shortlisted','rejected','hired')),
  match_score   numeric(5,2) check (match_score between 0 and 100),
  created_at    timestamptz not null default now(),
  constraint applications_unique unique (job_id, candidate_id)
);

create index idx_applications_job on public.applications(job_id);
create index idx_applications_candidate on public.applications(candidate_id);
create index idx_applications_status on public.applications(status);

-- ============================================================
-- saved_jobs
-- Candidate bookmarked jobs
-- ============================================================
create table public.saved_jobs (
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  job_id       uuid not null references public.jobs(id) on delete cascade,
  primary key (candidate_id, job_id)
);

create index idx_saved_jobs_candidate on public.saved_jobs(candidate_id);
