import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Loading, Empty, ErrorDisplay, ScoreBadge } from '@/components/ui'
import { SkillChip } from '@/components/SkillSearch'
import { formatSalary, timeAgo, cn } from '@/utils/helpers'
import toast from 'react-hot-toast'
import {
  MapPin, Clock, DollarSign, BookmarkIcon, ChevronRight,
  Briefcase, Filter, X
} from 'lucide-react'
import type { JobMatchResult, WorkMode } from '@/types/database'

interface Filters {
  minScore: number
  workMode: WorkMode | ''
  location: string
}

const DEFAULT_FILTERS: Filters = { minScore: 0, workMode: '', location: '' }

export function JobFeedPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobMatchResult | null>(null)

  // Fetch matched jobs via RPC
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['job_matches', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('match_jobs_for_candidate', { p_candidate_id: user!.id })
      if (error) throw error
      return (data ?? []) as JobMatchResult[]
    },
    enabled: !!user?.id,
  })

  // Fetch saved jobs to show bookmark state
  const { data: savedJobIds = [] } = useQuery({
    queryKey: ['saved_jobs', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('candidate_id', user!.id)
      return (data ?? []).map(r => r.job_id)
    },
    enabled: !!user?.id,
  })

  const toggleSave = useMutation({
    mutationFn: async (jobId: string) => {
      if (savedJobIds.includes(jobId)) {
        await supabase.from('saved_jobs').delete()
          .eq('candidate_id', user!.id).eq('job_id', jobId)
      } else {
        await supabase.from('saved_jobs').insert({ candidate_id: user!.id, job_id: jobId })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved_jobs', user?.id] }),
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Loading text="Finding your best matches…" />
  if (error) return <ErrorDisplay error={error as Error} />

  const filtered = (jobs ?? []).filter(j =>
    j.score >= filters.minScore &&
    (!filters.workMode || j.work_mode === filters.workMode) &&
    (!filters.location || j.location?.toLowerCase().includes(filters.location.toLowerCase()))
  ).sort((a, b) => b.score - a.score)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Job list panel */}
      <div className={cn('flex flex-col border-r border-gray-100 bg-white',
        selectedJob ? 'hidden lg:flex lg:w-2/5 xl:w-1/3' : 'w-full lg:w-2/5 xl:w-1/3'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Job Feed</h1>
            <p className="text-xs text-gray-400">{filtered.length} matches</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost p-2">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
            <div>
              <label className="label text-xs">Min match score: {filters.minScore}%</label>
              <input
                type="range" min={0} max={100} step={5}
                value={filters.minScore}
                onChange={e => setFilters(f => ({ ...f, minScore: Number(e.target.value) }))}
                className="w-full accent-brand-600"
              />
            </div>
            <div>
              <label className="label text-xs">Work Mode</label>
              <select
                className="input text-sm"
                value={filters.workMode}
                onChange={e => setFilters(f => ({ ...f, workMode: e.target.value as WorkMode | '' }))}
              >
                <option value="">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Location</label>
              <input
                className="input text-sm"
                placeholder="e.g. New York"
                value={filters.location}
                onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
              />
            </div>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="btn-ghost text-xs py-1"
            >
              <X className="h-3 w-3" /> Reset
            </button>
          </div>
        )}

        {/* Job cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <Empty
              icon={<Briefcase className="h-10 w-10" />}
              title="No matches found"
              description="Add more skills or adjust filters to see jobs."
              action={<Link to="/candidate/profile" className="btn-primary mt-2">Update Skills</Link>}
            />
          ) : (
            filtered.map(job => (
              <JobCard
                key={job.job_id}
                job={job}
                isSaved={savedJobIds.includes(job.job_id)}
                isSelected={selectedJob?.job_id === job.job_id}
                onSelect={() => setSelectedJob(job)}
                onToggleSave={() => toggleSave.mutate(job.job_id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedJob ? (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <JobDetail
            job={selectedJob}
            isSaved={savedJobIds.includes(selectedJob.job_id)}
            onToggleSave={() => toggleSave.mutate(selectedJob.job_id)}
            onClose={() => setSelectedJob(null)}
          />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center text-gray-300 bg-gray-50">
          <div className="text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-3" />
            <p className="text-sm">Select a job to see details</p>
          </div>
        </div>
      )}
    </div>
  )
}

function JobCard({
  job, isSaved, isSelected, onSelect, onToggleSave
}: {
  job: JobMatchResult
  isSaved: boolean
  isSelected: boolean
  onSelect: () => void
  onToggleSave: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
        isSelected && 'bg-brand-50 border-l-2 border-brand-500'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{job.title}</h3>
          <p className="text-xs text-gray-500 truncate">{job.company}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBadge score={job.score} />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onToggleSave() }}
            className="text-gray-400 hover:text-brand-600 transition-colors"
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
          >
            <BookmarkIcon className={cn('h-4 w-4', isSaved && 'fill-brand-500 text-brand-500')} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
        )}
        <span className="flex items-center gap-1 capitalize">
          <Clock className="h-3 w-3" />{job.work_mode}
        </span>
        {(job.salary_min || job.salary_max) && (
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />{formatSalary(job.salary_min, job.salary_max)}
          </span>
        )}
      </div>

      {/* Mini skill bar */}
      <div className="mt-2 flex gap-1 flex-wrap">
        {job.matched_skills.slice(0, 4).map((s: { skill_name: string }) => (
          <SkillChip key={s.skill_name} name={s.skill_name} proficiency={4} className="text-xs py-0.5 px-2" />
        ))}
        {job.matched_skills.length > 4 && (
          <span className="text-xs text-gray-400">+{job.matched_skills.length - 4} more</span>
        )}
      </div>
    </div>
  )
}

function JobDetail({
  job, isSaved, onToggleSave, onClose
}: {
  job: JobMatchResult
  isSaved: boolean
  onToggleSave: () => void
  onClose: () => void
}) {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: hasApplied } = useQuery({
    queryKey: ['application_check', user?.id, job.job_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('candidate_id', user!.id)
        .eq('job_id', job.job_id)
        .maybeSingle()
      return !!data
    },
    enabled: !!user?.id,
  })

  const apply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('applications').insert({
        job_id:       job.job_id,
        candidate_id: user!.id,
        match_score:  job.score,
        status:       'applied',
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Application submitted!')
      qc.invalidateQueries({ queryKey: ['application_check', user?.id, job.job_id] })
      qc.invalidateQueries({ queryKey: ['applications', user?.id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Mobile back */}
      <button onClick={onClose} className="btn-ghost mb-4 lg:hidden">← Back</button>

      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-gray-600 font-medium mt-0.5">{job.company}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
              {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
              <span className="flex items-center gap-1 capitalize"><Clock className="h-4 w-4" />{job.work_mode}</span>
              {(job.salary_min || job.salary_max) && (
                <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{formatSalary(job.salary_min, job.salary_max)}</span>
              )}
            </div>
          </div>
          <ScoreBadge score={job.score} />
        </div>

        <div className="flex gap-2 mt-4">
          {hasApplied ? (
            <span className="badge badge-green">✓ Applied</span>
          ) : (
            <button
              onClick={() => apply.mutate()}
              disabled={apply.isPending}
              className="btn-primary"
            >
              {apply.isPending ? 'Applying…' : 'Apply Now'}
            </button>
          )}
          <button
            onClick={onToggleSave}
            className={cn('btn-secondary gap-2', isSaved && 'text-brand-600')}
          >
            <BookmarkIcon className={cn('h-4 w-4', isSaved && 'fill-brand-500')} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Skill breakdown */}
      <div className="card mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Skill Match Breakdown</h3>

        {job.matched_skills.length > 0 && (
          <section className="mb-4">
            <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1.5">
              ✅ Matched ({job.matched_skills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.matched_skills.map((s: { skill_name: string; candidate_level: number; required_level: number }) => (
                <SkillChip
                  key={s.skill_name}
                  name={`${s.skill_name} (${s.candidate_level}/${s.required_level})`}
                  proficiency={4}
                />
              ))}
            </div>
          </section>
        )}

        {job.partial_skills.length > 0 && (
          <section className="mb-4">
            <h4 className="text-sm font-medium text-yellow-700 mb-2">🔶 Partial Match ({job.partial_skills.length})</h4>
            <div className="space-y-1.5">
              {job.partial_skills.map((s: { skill_name: string; via_skill_name: string; similarity: number }) => (
                <div key={s.skill_name} className="flex items-center gap-2 text-sm">
                  <SkillChip name={s.skill_name} proficiency={2} />
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">via {s.via_skill_name} ({Math.round(s.similarity * 100)}% similar)</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {job.missing_skills.length > 0 && (
          <section>
            <h4 className="text-sm font-medium text-red-700 mb-2">❌ Missing ({job.missing_skills.length})</h4>
            <div className="flex flex-wrap gap-2">
              {job.missing_skills.map((s: { skill_name: string; importance: string }) => (
                <SkillChip
                  key={s.skill_name}
                  name={`${s.skill_name}${s.importance === 'must' ? ' *' : ''}`}
                  className="bg-red-50 text-red-600"
                />
              ))}
            </div>
            {job.missing_skills.some((s: { importance: string }) => s.importance === 'must') && (
              <p className="text-xs text-red-500 mt-2">* = required skill (affects score)</p>
            )}
          </section>
        )}
      </div>

      {/* Skills to learn */}
      {job.missing_skills.length > 0 && (
        <div className="card border-dashed border-brand-200 bg-brand-50">
          <h3 className="font-semibold text-brand-900 mb-2">🎯 Skills to Learn</h3>
          <p className="text-sm text-brand-700 mb-3">
            Adding these skills could significantly boost your match score:
          </p>
          <div className="flex flex-wrap gap-2">
            {job.missing_skills
              .sort((a: { importance: string }, b: { importance: string }) => a.importance === 'must' ? -1 : 1)
              .slice(0, 5)
              .map((s: { skill_name: string; importance: string }) => (
                <span key={s.skill_name} className="badge badge-purple">
                  {s.skill_name} {s.importance === 'must' ? '(must-have)' : '(nice-to-have)'}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
