import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { SkillSearch, SkillChip } from '@/components/SkillSearch'
import { Loading, ErrorDisplay } from '@/components/ui'
import { PROFICIENCY_LABELS } from '@/utils/helpers'
import { Loader2, MapPin, Briefcase, User } from 'lucide-react'
import type { Skill, CandidateSkill } from '@/types/database'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  headline:  z.string().max(120).optional(),
  location:  z.string().max(80).optional(),
  years_experience: z.coerce.number().int().min(0).max(50).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

/** Pending skill being added (before save) */
interface PendingSkill {
  skill: Skill
  proficiency: number
  years: number | null
}

export function CandidateProfilePage() {
  const { user, profile } = useAuth()
  const qc = useQueryClient()
  const [pendingSkill, setPendingSkill] = useState<PendingSkill | null>(null)

  // Fetch existing candidate skills
  const { data: candidateSkills, isLoading: skillsLoading, error: skillsError } = useQuery({
    queryKey: ['candidate_skills', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_skills')
        .select('*, skill:skills(*)')
        .eq('candidate_id', user!.id)
      if (error) throw error
      return data as (CandidateSkill & { skill: Skill })[]
    },
    enabled: !!user?.id,
  })

  // Profile form
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      headline:  profile?.headline  ?? '',
      location:  profile?.location  ?? '',
      years_experience: profile?.years_experience ?? undefined,
    },
  })

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Profile updated!')
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const addSkill = useMutation({
    mutationFn: async (ps: PendingSkill) => {
      const { error } = await supabase
        .from('candidate_skills')
        .upsert({
          candidate_id: user!.id,
          skill_id:     ps.skill.id,
          proficiency:  ps.proficiency,
          years:        ps.years,
        })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Skill added!')
      qc.invalidateQueries({ queryKey: ['candidate_skills', user?.id] })
      setPendingSkill(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const removeSkill = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', user!.id)
        .eq('skill_id', skillId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Skill removed')
      qc.invalidateQueries({ queryKey: ['candidate_skills', user?.id] })
    },
  })

  const existingIds = candidateSkills?.map(cs => cs.skill_id) ?? []

  if (skillsLoading) return <Loading text="Loading profile…" />
  if (skillsError) return <ErrorDisplay error={skillsError as Error} />

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Profile info */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          <User className="inline h-4 w-4 mr-1" /> Profile Info
        </h2>
        <form onSubmit={handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('full_name')} className="input" />
              {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label">Location <span className="text-gray-400 font-normal">(optional)</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input {...register('location')} className="input pl-9" placeholder="City, Country" />
              </div>
            </div>
          </div>
          <div>
            <label className="label">Professional Headline <span className="text-gray-400 font-normal">(optional)</span></label>
            <input {...register('headline')} className="input" placeholder="e.g. Full-Stack Engineer with 5 years in React" />
          </div>
          <div className="w-40">
            <label className="label">
              <Briefcase className="inline h-4 w-4 mr-1" />
              Years of Experience
            </label>
            <input type="number" min={0} max={50} {...register('years_experience')} className="input" />
          </div>
          <button
            type="submit"
            disabled={!isDirty || updateProfile.isPending}
            className="btn-primary"
          >
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Profile
          </button>
        </form>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">My Skills</h2>

        {/* Existing skills */}
        {candidateSkills && candidateSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {candidateSkills.map(cs => (
              <SkillChip
                key={cs.skill_id}
                name={`${cs.skill?.name} · ${PROFICIENCY_LABELS[cs.proficiency]}`}
                proficiency={cs.proficiency}
                onRemove={() => removeSkill.mutate(cs.skill_id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">No skills added yet. Search and add skills below.</p>
        )}

        {/* Add skill */}
        <div className="border-t border-gray-100 pt-4">
          <label className="label">Add a Skill</label>
          <SkillSearch
            onSelect={skill => setPendingSkill({ skill, proficiency: 3, years: null })}
            excludeIds={existingIds}
          />

          {/* Proficiency picker for pending skill */}
          {pendingSkill && (
            <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm font-medium text-gray-900 mb-3">
                Adding: <span className="text-brand-700">{pendingSkill.skill.name}</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Proficiency</label>
                  <select
                    className="input"
                    value={pendingSkill.proficiency}
                    onChange={e => setPendingSkill({ ...pendingSkill, proficiency: Number(e.target.value) })}
                  >
                    {[1,2,3,4,5].map(n => (
                      <option key={n} value={n}>{n} – {PROFICIENCY_LABELS[n]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Years (optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    className="input"
                    value={pendingSkill.years ?? ''}
                    onChange={e => setPendingSkill({ ...pendingSkill, years: e.target.value ? Number(e.target.value) : null })}
                    placeholder="e.g. 2.5"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => addSkill.mutate(pendingSkill)}
                  disabled={addSkill.isPending}
                  className="btn-primary"
                >
                  {addSkill.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add Skill
                </button>
                <button type="button" onClick={() => setPendingSkill(null)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
