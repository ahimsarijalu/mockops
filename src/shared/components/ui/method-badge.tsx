import { cn } from '@/shared/lib/utils'

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  POST: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded px-1.5 py-0.5 text-xs font-mono font-semibold',
        methodColors[method] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {method}
    </span>
  )
}
