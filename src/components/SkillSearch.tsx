import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Search, X, Plus } from 'lucide-react'
import type { Skill } from '@/types/database'
import { cn } from '@/utils/helpers'

interface SkillSearchProps {
  onSelect: (skill: Skill) => void
  excludeIds?: string[]
  placeholder?: string
}

/** Searchable skill autocomplete dropdown */
export function SkillSearch({ onSelect, excludeIds = [], placeholder = 'Search skills…' }: SkillSearchProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: skills = [] } = useQuery({
    queryKey: ['skills', query],
    queryFn: async () => {
      if (query.length < 2) return []
      const { data } = await supabase
        .from('skills')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(20)
      return (data ?? []) as Skill[]
    },
    enabled: query.length >= 2,
  })

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = skills.filter(s => !excludeIds.includes(s.id))

  function handleSelect(skill: Skill) {
    onSelect(skill)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          className="input pl-9"
          placeholder={placeholder}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.map(skill => (
              <li key={skill.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(skill)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{skill.category}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && query.length >= 2 && filtered.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg px-4 py-3 text-sm text-gray-500">
          No skills found for "{query}"
        </div>
      )}
    </div>
  )
}

interface SkillChipProps {
  name: string
  proficiency?: number
  onRemove?: () => void
  className?: string
}

const PROFICIENCY_COLORS = ['', 'bg-gray-100 text-gray-600', 'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700', 'bg-violet-100 text-violet-700', 'bg-green-100 text-green-700']

export function SkillChip({ name, proficiency, onRemove, className }: SkillChipProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
      proficiency ? PROFICIENCY_COLORS[proficiency] : 'bg-brand-100 text-brand-700',
      className
    )}>
      {name}
      {onRemove && (
        <button type="button" onClick={onRemove} className="rounded-full hover:opacity-70">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
