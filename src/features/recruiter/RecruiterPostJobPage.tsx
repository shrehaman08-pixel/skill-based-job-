import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { SkillSearch, SkillChip } from '@/components/SkillSearch'
import { Loading } from '@/components/ui'
import toast from 'react-hot-toast'
import { Loader2, Trash2 } from 'lucide-react'
import type { Skill, Importance } from '@/types/database'
import { PROFICIENCY_LABELS } from '@/utils/helpers'

const jobSchema = z.object({
  title:       z.string().min(2, 'Job title required'),
  company:     z.string().min(1, 'Company name required'),
  description: z.string().optional(),
  location:    z.string().optional(),
  work_mode:   z.enum(['remote', 'hybrid', 'onsite']),
  salary_min:  z.coerce.number().int().min(0).optional().or(z.literal('')),
  salary_max:  z.coerce.number().int().min(0).optional().or(z.literal('')),
  status:      z.enum(['draft', 'active', 'closed']),
})

type JobForm = z.infer<typeof jobSchema>

interface JobSkillEntry {
  skill: Skill
  required_level: number
  importance: Importance
  weight: number
}

export function RecruiterPostJobPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { jobId } = useParams()
  const qc = useQueryClient()
  const isEditing = !!jobId
  const [jobSkills, setJobSkills] = useState<JobSkillEntry[]>([])

  // Load existing job if editing
  const { isLoading: loadingJob } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId!).single()
      const { data: skills } = await supabase
        .from('job_skills')
        .select('*, skill:skills(*)')
        .eq('job_id', jobId!)
      if (job) {
        reset({
          title:       job.title,
          company:     job.company,
          description: job.description ?? '',
          location:    job.location ?? '',
          work_mode:   job.work_mode,
          salary_min:  job.salary_min ?? '',
          salary_max:  job.salary_max ?? '',
          status:      job.status,
        })
      }
      if (skills) {
        setJobSkills(skills.map((s: { skill: Skill; required_level: number; importance: Importance; weight: number }) => ({
          skill: s.skill,
          required_level: s.required_level,
          importance:  s.importance,
          weight:      s.weight,
        })))
      }
      return job
    },
    enabled: isEditing,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      work_mode: 'hybrid',
      status:    'active',
    },
  })

  const saveJob = useMutation({
    mutationFn: async (data: JobForm) => {
      const payload = {
        recruiter_id: user!.id,
        title:        data.title,
        company:      data.company,
        description:  data.description || null,
        location:     data.location || null,
        work_mode:    data.work_mode,
        salary_min:   data.salary_min ? Number(data.salary_min) : null,
        salary_max:   data.salary_max ? Number(data.salary_max) : null,
        status:       data.status,
      }

      let jId = jobId
      if (isEditing) {
        const { error } = await supabase.from('jobs').update(payload).eq('id', jobId!)
        if (error) throw error
      } else {
        const { data: created, error } = await supabase.from('jobs').insert(payload).select().single()
        if (error) throw error
        jId = created.id
      }

      // Sync job skills: delete all then re-insert
      await supabase.from('job_skills').delete().eq('job_id', jId!)
      if (jobSkills.length > 0) {
        const { error } = await supabase.from('job_skills').insert(
          jobSkills.map(js => ({
            job_id:         jId!,
            skill_id:       js.skill.id,
            required_level: js.required_level,
            importance:     js.importance,
            weight:         js.weight,
          }))
        )
        if (error) throw error
      }

      return jId!
    },
    onSuccess: (jId) => {
      toast.success(isEditing ? 'Job updated!' : 'Job posted!')
      qc.invalidateQueries({ queryKey: ['recruiter_jobs', user?.id] })
      navigate(`/recruiter/jobs/${jId}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function addJobSkill(skill: Skill) {
    setJobSkills(prev => [
      ...prev,
      { skill, required_level: 3, importance: 'must', weight: 1.0 }
    ])
  }

  function updateJobSkill(index: number, updates: Partial<Omit<JobSkillEntry, 'skill'>>) {
    setJobSkills(prev => prev.map((js, i) => i === index ? { ...js, ...updates } : js))
  }

  function removeJobSkill(index: number) {
    setJobSkills(prev => prev.filter((_, i) => i !== index))
  }

  if (isEditing && loadingJob) return <Loading text="Loading job…" />

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Edit Job' : 'Post a Job'}
      </h1>

      <form onSubmit={handleSubmit(d => saveJob.mutate(d))} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Job Details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job Title *</label>
              <input {...register('title')} className="input" placeholder="e.g. Senior Frontend Engineer" />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Company *</label>
              <input {...register('company')} className="input" placeholder="Acme Corp" />
              {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Describe the role, responsibilities, and culture…" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="New York, NY" />
            </div>
            <div>
              <label className="label">Work Mode</label>
              <select {...register('work_mode')} className="input">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Min Salary (USD)</label>
              <input type="number" {...register('salary_min')} className="input" placeholder="80000" />
            </div>
            <div>
              <label className="label">Max Salary (USD)</label>
              <input type="number" {...register('salary_max')} className="input" placeholder="120000" />
            </div>
          </div>
        </div>

        {/* Required skills */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Required Skills</h2>

          {jobSkills.length > 0 && (
            <div className="space-y-3 mb-4">
              {jobSkills.map((js, i) => (
                <div key={js.skill.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <SkillChip name={js.skill.name} className="flex-shrink-0" />

                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 text-xs">Level:</label>
                    <select
                      className="input py-1 text-xs w-36"
                      value={js.required_level}
                      onChange={e => updateJobSkill(i, { required_level: Number(e.target.value) })}
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} – {PROFICIENCY_LABELS[n]}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 text-xs">Type:</label>
                    <select
                      className="input py-1 text-xs w-24"
                      value={js.importance}
                      onChange={e => updateJobSkill(i, { importance: e.target.value as Importance })}
                    >
                      <option value="must">Must</option>
                      <option value="nice">Nice</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-500 text-xs">Weight:</label>
                    <input
                      type="number"
                      min={0.1}
                      max={5}
                      step={0.1}
                      value={js.weight}
                      onChange={e => updateJobSkill(i, { weight: Number(e.target.value) })}
                      className="input py-1 text-xs w-16"
                    />
                  </div>

                  <button type="button" onClick={() => removeJobSkill(i)} className="ml-auto text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <SkillSearch
            onSelect={addJobSkill}
            excludeIds={jobSkills.map(js => js.skill.id)}
            placeholder="Search and add required skills…"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saveJob.isPending} className="btn-primary">
            {saveJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isEditing ? 'Save Changes' : 'Post Job'}
          </button>
          <button type="button" onClick={() => navigate('/recruiter')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
