import type { StubMapping } from '@/shared/types/wiremock'

export function getMappingUrl(mapping: StubMapping): string {
  const { request } = mapping
  return request.url ?? request.urlPath ?? request.urlPattern ?? request.urlPathPattern ?? '*'
}

export function getMappingUrlMatchType(mapping: StubMapping): string {
  const { request } = mapping
  if (request.url) return 'url'
  if (request.urlPath) return 'urlPath'
  if (request.urlPattern) return 'urlPattern'
  if (request.urlPathPattern) return 'urlPathPattern'
  return 'url'
}

export function isMappingDisabled(mapping: StubMapping): boolean {
  const meta = mapping.metadata as { disabled?: boolean } | undefined
  return meta?.disabled === true
}

export function getMappingTags(mapping: StubMapping): string[] {
  const meta = mapping.metadata as { tags?: unknown } | undefined
  if (Array.isArray(meta?.tags)) return meta.tags.filter((t): t is string => typeof t === 'string')
  return []
}

export function getMappingStatusCode(mapping: StubMapping): number | undefined {
  return mapping.response.status
}

export function getMappingKind(mapping: StubMapping): {
  proxy: boolean
  responseFile: boolean
  scenario: boolean
} {
  return {
    proxy: !!mapping.response.proxyBaseUrl,
    responseFile: !!mapping.response.bodyFileName,
    scenario: !!mapping.scenarioName,
  }
}

export function emptyStubMapping(): StubMapping {
  return {
    name: '',
    request: { method: 'GET', urlPath: '/' },
    response: { status: 200, jsonBody: {}, headers: { 'Content-Type': 'application/json' } },
    persistent: true,
  }
}
