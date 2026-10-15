import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Loading, Empty, ErrorDisplay } from '@/components/ui'
import { ScoreBadge } from '@/components/ui'
import { STATUS_BADGE, capitalize, timeAgo } from '@/utils/helpers'
import { FileText, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Application, Job } from '@/types/database'

export function CandidateApplicationsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, job:jobs(*)')
        .eq('candidate_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Application & { job: Job })[]
    },
    enabled: !!user?.id,
  })

  if (isLoading) return <Loading text="Loading applications…" />
  if (error) return <ErrorDisplay error={error as Error} />

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

      {applications?.length === 0 ? (
        <Empty
          icon={<FileText className="h-10 w-10" />}
          title="No applications yet"
          description="Apply to jobs from your job feed."
        />
      ) : (
        <div className="space-y-3">
          {applications?.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                  <p className="text-sm text-gray-500">{app.job?.company}</p>
                  {app.job?.location && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{app.job.location}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${STATUS_BADGE[app.status]}`}>{capitalize(app.status)}</span>
                  {app.match_score && <ScoreBadge score={app.match_score} />}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Applied {timeAgo(app.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CandidateSavedJobsPage() {
  const { user } = useAuth()

  const { data: saved, isLoading, error } = useQuery({
    queryKey: ['saved_jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*, job:jobs(*)')
        .eq('candidate_id', user!.id)
      if (error) throw error
      return data as { candidate_id: string; job_id: string; job: Job }[]
    },
    enabled: !!user?.id,
  })

  const qc = useQueryClient()

  const unsave = useMutation({
    mutationFn: async (jobId: string) => {
      await supabase.from('saved_jobs')
        .delete()
        .eq('candidate_id', user!.id)
        .eq('job_id', jobId)
    },
    onSuccess: () => {
      toast.success('Removed from saved')
      qc.invalidateQueries({ queryKey: ['saved_jobs', user?.id] })
    },
  })

  if (isLoading) return <Loading text="Loading saved jobs…" />
  if (error) return <ErrorDisplay error={error as Error} />

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>

      {saved?.length === 0 ? (
        <Empty
          icon={<FileText className="h-10 w-10" />}
          title="No saved jobs"
          description="Bookmark jobs from your feed to review them later."
        />
      ) : (
        <div className="space-y-3">
          {saved?.map(({ job_id, job }) => (
            <div key={job_id} className="card flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">{job?.title}</h3>
                <p className="text-sm text-gray-500">{job?.company}</p>
                {job?.location && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{job.location}
                  </p>
                )}
              </div>
              <button
                onClick={() => unsave.mutate(job_id)}
                className="btn-ghost text-red-500 hover:bg-red-50 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
