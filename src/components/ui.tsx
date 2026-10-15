import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface LoadingProps {
  className?: string
  text?: string
}

export function Loading({ className, text }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
}

interface EmptyProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function Empty({ icon, title, description, action, className }: EmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      {icon && <div className="text-gray-300">{icon}</div>}
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

interface ErrorDisplayProps {
  error?: Error | null
  message?: string
  onRetry?: () => void
}

export function ErrorDisplay({ error, message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-red-500 font-medium">{message ?? error?.message ?? 'Something went wrong'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">Try again</button>
      )}
    </div>
  )
}

/** Score circle badge */
export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-100 text-green-700' :
    score >= 60 ? 'bg-yellow-100 text-yellow-700' :
    score >= 40 ? 'bg-blue-100 text-blue-700' :
    'bg-red-100 text-red-700'

  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-bold', color)}>
      {Math.round(score)}%
    </span>
  )
}

/** Progress bar */
export function ProgressBar({ value, max = 100, color = 'brand' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div
        className={cn('h-2 rounded-full transition-all', colorMap[color] ?? colorMap['brand'])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
