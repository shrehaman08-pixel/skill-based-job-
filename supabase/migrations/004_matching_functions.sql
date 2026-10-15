-- Migration 004: Matching Engine RPC Functions
--
-- match_jobs_for_candidate(p_candidate_id uuid)
--   Returns jobs ranked by match score for a given candidate.
--
-- match_candidates_for_job(p_job_id uuid)
--   Returns candidates ranked by match score for a given job.
--
-- Scoring algorithm:
--   For each job_skill:
--     direct_credit  = min(candidate_level / required_level, 1.0)  if candidate has skill
--     partial_credit = similarity * 0.7 * min(candidate_level / required_level, 1.0)  via related skill (best match)
--     credit = max(direct_credit, best_partial_credit)
--
--     effective_weight = weight * (2 if importance='must', 1 if 'nice')
--
--   raw_score = 100 * SUM(effective_weight * credit) / SUM(effective_weight)
--   penalty:  if any 'must' skill has credit = 0, multiply by 0.75
--
-- Returns JSON arrays: matched_skills, partial_skills, missing_skills


-- ============================================================
-- match_jobs_for_candidate
-- ============================================================
create or replace function public.match_jobs_for_candidate(p_candidate_id uuid)
returns table (
  job_id          uuid,
  title           text,
  company         text,
  location        text,
  work_mode       text,
  salary_min      int,
  salary_max      int,
  status          text,
  score           numeric,
  matched_skills  jsonb,
  partial_skills  jsonb,
  missing_skills  jsonb
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_job record;
begin
  -- Iterate only active jobs
  for v_job in
    select j.id from public.jobs j where j.status = 'active'
  loop
    return query
      select * from _score_job_for_candidate(v_job.id, p_candidate_id);
  end loop;
end;
$$;


-- ============================================================
-- match_candidates_for_job
-- ============================================================
create or replace function public.match_candidates_for_job(p_job_id uuid)
returns table (
  candidate_id    uuid,
  full_name       text,
  headline        text,
  location        text,
  years_experience int,
  score           numeric,
  matched_skills  jsonb,
  partial_skills  jsonb,
  missing_skills  jsonb
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_cand record;
begin
  for v_cand in
    select distinct a.candidate_id
    from public.applications a
    where a.job_id = p_job_id
  loop
    return query
      select * from _score_candidate_for_job(p_job_id, v_cand.candidate_id);
  end loop;
end;
$$;


-- ============================================================
-- Internal helper: score one job for one candidate
-- Returns single row via RETURN QUERY SELECT
-- ============================================================
create or replace function public._score_job_for_candidate(
  p_job_id       uuid,
  p_candidate_id uuid
)
returns table (
  job_id         uuid,
  title          text,
  company        text,
  location       text,
  work_mode      text,
  salary_min     int,
  salary_max     int,
  status         text,
  score          numeric,
  matched_skills jsonb,
  partial_skills jsonb,
  missing_skills jsonb
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_total_weight   numeric := 0;
  v_weighted_score numeric := 0;
  v_has_must_zero  boolean := false;
  v_matched        jsonb   := '[]'::jsonb;
  v_partial        jsonb   := '[]'::jsonb;
  v_missing        jsonb   := '[]'::jsonb;
  v_js             record;
  v_cand_level     int;
  v_direct_credit  numeric;
  v_best_partial   numeric := 0;
  v_best_via_id    uuid;
  v_best_via_name  text;
  v_best_sim       numeric;
  v_eff_weight     numeric;
  v_credit         numeric;
  v_job            record;
  v_rel            record;
  v_skill_name     text;
begin
  select j.* into v_job from public.jobs j where j.id = p_job_id;
  if not found then return; end if;

  for v_js in
    select js.skill_id, js.required_level, js.importance, js.weight, s.name as skill_name
    from public.job_skills js
    join public.skills s on s.id = js.skill_id
    where js.job_id = p_job_id
  loop
    v_eff_weight := v_js.weight * case when v_js.importance = 'must' then 2.0 else 1.0 end;
    v_total_weight := v_total_weight + v_eff_weight;

    -- Check direct skill match
    select cs.proficiency into v_cand_level
    from public.candidate_skills cs
    where cs.candidate_id = p_candidate_id and cs.skill_id = v_js.skill_id;

    if found then
      v_direct_credit := least(v_cand_level::numeric / v_js.required_level::numeric, 1.0);
    else
      v_direct_credit := 0;
    end if;

    -- Check related skill fallback
    v_best_partial := 0;
    v_best_via_id := null;
    v_best_via_name := null;
    v_best_sim := 0;

    if v_direct_credit < 1.0 then
      for v_rel in
        select sr.related_skill_id, sr.similarity, s2.name as via_name
        from public.skill_relations sr
        join public.skills s2 on s2.id = sr.related_skill_id
        where sr.skill_id = v_js.skill_id
        order by sr.similarity desc
      loop
        declare
          v_via_level int;
          v_partial_credit numeric;
        begin
          select cs.proficiency into v_via_level
          from public.candidate_skills cs
          where cs.candidate_id = p_candidate_id and cs.skill_id = v_rel.related_skill_id;

          if found then
            v_partial_credit := v_rel.similarity * 0.7
              * least(v_via_level::numeric / v_js.required_level::numeric, 1.0);
            if v_partial_credit > v_best_partial then
              v_best_partial := v_partial_credit;
              v_best_via_id  := v_rel.related_skill_id;
              v_best_via_name := v_rel.via_name;
              v_best_sim     := v_rel.similarity;
            end if;
          end if;
        end;
      end loop;
    end if;

    -- Final credit for this skill
    v_credit := greatest(v_direct_credit, v_best_partial);

    -- Track must-zero penalty
    if v_js.importance = 'must' and v_credit = 0 then
      v_has_must_zero := true;
    end if;

    v_weighted_score := v_weighted_score + v_eff_weight * v_credit;

    -- Classify into result arrays
    if v_direct_credit > 0 then
      v_matched := v_matched || jsonb_build_object(
        'skill_id',       v_js.skill_id,
        'skill_name',     v_js.skill_name,
        'candidate_level', v_cand_level,
        'required_level', v_js.required_level,
        'credit',         round(v_direct_credit, 3)
      );
    elsif v_best_partial > 0 then
      v_partial := v_partial || jsonb_build_object(
        'skill_id',       v_js.skill_id,
        'skill_name',     v_js.skill_name,
        'via_skill_id',   v_best_via_id,
        'via_skill_name', v_best_via_name,
        'similarity',     v_best_sim,
        'credit',         round(v_best_partial, 3)
      );
    else
      v_missing := v_missing || jsonb_build_object(
        'skill_id',       v_js.skill_id,
        'skill_name',     v_js.skill_name,
        'importance',     v_js.importance,
        'required_level', v_js.required_level
      );
    end if;
  end loop;

  -- Compute final score
  declare
    v_raw_score numeric;
    v_final_score numeric;
  begin
    if v_total_weight = 0 then
      v_raw_score := 0;
    else
      v_raw_score := 100.0 * v_weighted_score / v_total_weight;
    end if;

    v_final_score := case when v_has_must_zero then v_raw_score * 0.75 else v_raw_score end;

    return query select
      v_job.id,
      v_job.title,
      v_job.company,
      v_job.location,
      v_job.work_mode,
      v_job.salary_min,
      v_job.salary_max,
      v_job.status,
      round(v_final_score, 2),
      v_matched,
      v_partial,
      v_missing;
  end;
end;
$$;


-- ============================================================
-- Internal helper: score one candidate for one job
-- ============================================================
create or replace function public._score_candidate_for_job(
  p_job_id       uuid,
  p_candidate_id uuid
)
returns table (
  candidate_id     uuid,
  full_name        text,
  headline         text,
  location         text,
  years_experience int,
  score            numeric,
  matched_skills   jsonb,
  partial_skills   jsonb,
  missing_skills   jsonb
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_score_row record;
  v_profile   record;
begin
  select p.full_name, p.headline, p.location, p.years_experience
  into v_profile
  from public.profiles p
  where p.id = p_candidate_id;

  -- Reuse the job-scoring logic (returns job fields, we just need score + arrays)
  select s.score, s.matched_skills, s.partial_skills, s.missing_skills
  into v_score_row
  from public._score_job_for_candidate(p_job_id, p_candidate_id) s;

  return query select
    p_candidate_id,
    v_profile.full_name,
    v_profile.headline,
    v_profile.location,
    v_profile.years_experience,
    v_score_row.score,
    v_score_row.matched_skills,
    v_score_row.partial_skills,
    v_score_row.missing_skills;
end;
$$;


-- ============================================================
-- Grant execute to authenticated users
-- (RLS on underlying tables still enforces data visibility)
-- ============================================================
grant execute on function public.match_jobs_for_candidate(uuid)    to authenticated;
grant execute on function public.match_candidates_for_job(uuid)    to authenticated;
grant execute on function public._score_job_for_candidate(uuid,uuid) to authenticated;
grant execute on function public._score_candidate_for_job(uuid,uuid) to authenticated;
