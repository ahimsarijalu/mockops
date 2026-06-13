import type { StubMapping } from '@/shared/types/wiremock'
import { getMappingTags, getMappingUrl } from './mapping-helpers'

export function matchesSearch(mapping: StubMapping, query: string): boolean {
  if (!query.trim()) return true
  const needle = query.trim().toLowerCase()
  const haystack = [
    mapping.name,
    mapping.id,
    mapping.uuid,
    getMappingUrl(mapping),
    mapping.scenarioName,
    mapping.response.bodyFileName,
    ...getMappingTags(mapping),
    JSON.stringify(mapping.metadata ?? {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return needle.split(/\s+/).every((term) => haystack.includes(term))
}
