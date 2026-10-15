import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Loading, Empty, ErrorDisplay, ScoreBadge } from '@/components/ui'
import { STATUS_BADGE, capitalize, timeAgo } from '@/utils/helpers'
import toast from 'react-hot-toast'
import { Plus, Users, Edit2, Trash2, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import type { Job, CandidateMatchResult, ApplicationStatus } from '@/types/database'
import { SkillChip } from '@/components/SkillSearch'

export function RecruiterDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['recruiter_jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Job[]
    },
    enabled: !!user?.id,
  })

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.from('jobs').delete().eq('id', jobId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Job deleted')
      qc.invalidateQueries({ queryKey: ['recruiter_jobs', user?.id] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Loading text="Loading jobs…" />
  if (error) return <ErrorDisplay error={error as Error} />

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 mt-1 text-sm">{jobs?.length ?? 0} postings</p>
        </div>
        <Link to="/recruiter/post" className="btn-primary">
          <Plus className="h-4 w-4" /> Post a Job
        </Link>
      </div>

      {jobs?.length === 0 ? (
        <Empty
          icon={<Users className="h-10 w-10" />}
          title="No jobs posted"
          description="Post your first skill-based job to find the best candidates."
          action={<Link to="/recruiter/post" className="btn-primary mt-3">Post a Job</Link>}
        />
      ) : (
        <div className="space-y-4">
          {jobs?.map(job => (
            <div key={job.id} className="card">
              {/* Job header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${STATUS_BADGE[job.status] ?? 'badge-gray'}`}>
                      {capitalize(job.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{job.company}</p>
                  {job.location && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(job.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/recruiter/post/${job.id}`} className="btn-ghost p-2">
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Delete this job?')) deleteJob.mutate(job.id)
                    }}
                    className="btn-ghost p-2 text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                    className="btn-ghost p-2"
                  >
                    {expandedJob === job.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded: candidate ranking */}
              {expandedJob === job.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <CandidateRanking jobId={job.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CandidateRanking({ jobId }: { jobId: string }) {
  const { data: candidates, isLoading, error } = useQuery({
    queryKey: ['candidate_ranking', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('match_candidates_for_job', { p_job_id: jobId })
      if (error) throw error
      return (data ?? []) as CandidateMatchResult[]
    },
  })

  const qc = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: async ({ jobId, candidateId, status }: { jobId: string; candidateId: string; status: ApplicationStatus }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['candidate_ranking', jobId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <Loading className="py-8" text="Ranking candidates…" />
  if (error) return <ErrorDisplay error={error as Error} />

  if (!candidates || candidates.length === 0) {
    return (
      <Empty
        title="No applicants yet"
        description="Share the job link to attract candidates."
        className="py-8"
      />
    )
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" /> Applicants ({candidates.length})
      </h4>
      <div className="space-y-3">
        {candidates.sort((a, b) => b.score - a.score).map(c => (
          <CandidateCard
            key={c.candidate_id}
            candidate={c}
            jobId={jobId}
            onStatusChange={status =>
              updateStatus.mutate({ jobId, candidateId: c.candidate_id, status })
            }
          />
        ))}
      </div>
    </div>
  )
}

function CandidateCard({
  candidate, jobId, onStatusChange
}: {
  candidate: CandidateMatchResult
  jobId: string
  onStatusChange: (status: ApplicationStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)

  // Fetch current application status
  const { data: app } = useQuery({
    queryKey: ['application_status', jobId, candidate.candidate_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', jobId)
        .eq('candidate_id', candidate.candidate_id)
        .single()
      return data
    },
  })

  const statuses: ApplicationStatus[] = ['applied', 'shortlisted', 'rejected', 'hired']

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
            {candidate.full_name?.charAt(0) ?? '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{candidate.full_name ?? 'Anonymous'}</p>
            {candidate.headline && <p className="text-xs text-gray-500">{candidate.headline}</p>}
            {candidate.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{candidate.location}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreBadge score={candidate.score} />
          <select
            className="input text-xs py-1 w-28"
            value={app?.status ?? 'applied'}
            onChange={e => onStatusChange(e.target.value as ApplicationStatus)}
          >
            {statuses.map(s => <option key={s} value={s}>{capitalize(s)}</option>)}
          </select>
          <button onClick={() => setExpanded(!expanded)} className="btn-ghost p-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {candidate.matched_skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">✅ Matched</p>
              <div className="flex flex-wrap gap-1">
                {candidate.matched_skills.map((s: { skill_name: string }) => (
                  <SkillChip key={s.skill_name} name={s.skill_name} proficiency={4} className="text-xs py-0.5 px-2" />
                ))}
              </div>
            </div>
          )}
          {candidate.partial_skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-yellow-700 mb-1">🔶 Partial</p>
              <div className="flex flex-wrap gap-1">
                {candidate.partial_skills.map((s: { skill_name: string }) => (
                  <SkillChip key={s.skill_name} name={s.skill_name} proficiency={2} className="text-xs py-0.5 px-2" />
                ))}
              </div>
            </div>
          )}
          {candidate.missing_skills.length > 0 && (
            <div>
              <p className="text-xs font-medium text-red-700 mb-1">❌ Missing</p>
              <div className="flex flex-wrap gap-1">
                {candidate.missing_skills.map((s: { skill_name: string }) => (
                  <SkillChip key={s.skill_name} name={s.skill_name} className="bg-red-50 text-red-600 text-xs py-0.5 px-2" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
