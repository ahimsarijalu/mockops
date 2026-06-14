import type { ServeEvent } from '@/shared/types/wiremock'

export function getStatusBadgeVariant(
  status: number | undefined,
): 'success' | 'warning' | 'destructive' | 'secondary' {
  if (status === undefined) return 'secondary'
  if (status >= 500) return 'destructive'
  if (status >= 400) return 'warning'
  return 'success'
}

export function isUnmatched(event: ServeEvent): boolean {
  if (event.wasMatched === false) return true
  return !event.stubMapping
}

export function matchesRequestSearch(event: ServeEvent, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const terms = q.split(/\s+/)
  const haystack = [
    event.request.url,
    event.request.method,
    event.id,
    event.stubMapping?.name,
    event.stubMapping?.id,
    String(event.response?.status ?? ''),
    JSON.stringify(event.request.headers ?? {}),
  ]
    .join(' ')
    .toLowerCase()

  return terms.every((term) => haystack.includes(term))
}
