import type { LoggedRequest, RequestPattern, StringValuePattern } from '@/shared/types/wiremock'

export type MismatchField = 'method' | 'url' | 'header' | 'queryParameter' | 'cookie' | 'body'

export interface Mismatch {
  field: MismatchField
  label: string
  expected: string
  actual: string
}

function describePattern(pattern: StringValuePattern): string {
  const entries = Object.entries(pattern).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return '(any)'
  return entries.map(([matcher, value]) => `${matcher}: ${JSON.stringify(value)}`).join(', ')
}

function testStringPattern(pattern: StringValuePattern, value: string | undefined): boolean {
  const v = value ?? ''
  if (pattern.absent !== undefined)
    return pattern.absent ? value === undefined : value !== undefined
  if (pattern.equalTo !== undefined) {
    return pattern.caseInsensitive
      ? v.toLowerCase() === pattern.equalTo.toLowerCase()
      : v === pattern.equalTo
  }
  if (pattern.contains !== undefined) return v.includes(pattern.contains)
  if (pattern.matches !== undefined) {
    try {
      return new RegExp(pattern.matches).test(v)
    } catch {
      return false
    }
  }
  if (pattern.doesNotMatch !== undefined) {
    try {
      return !new RegExp(pattern.doesNotMatch).test(v)
    } catch {
      return false
    }
  }
  // Matchers we can't evaluate client-side (JSON/XPath/JSON-path/etc.) are
  // treated as indeterminate — never flagged as a hard mismatch.
  return true
}

function checkUrl(request: LoggedRequest, pattern: RequestPattern): Mismatch | null {
  const actual = request.url
  if (pattern.url !== undefined && pattern.url !== actual) {
    return { field: 'url', label: 'URL', expected: pattern.url, actual }
  }
  if (pattern.urlPath !== undefined) {
    const actualPath = actual.split('?')[0]
    if (pattern.urlPath !== actualPath) {
      return { field: 'url', label: 'URL path', expected: pattern.urlPath, actual: actualPath }
    }
  }
  if (pattern.urlPattern !== undefined) {
    try {
      if (!new RegExp(pattern.urlPattern).test(actual)) {
        return { field: 'url', label: 'URL pattern', expected: pattern.urlPattern, actual }
      }
    } catch {
      // invalid regex on the mapping side — not something the request can be blamed for
    }
  }
  if (pattern.urlPathPattern !== undefined) {
    const actualPath = actual.split('?')[0]
    try {
      if (!new RegExp(pattern.urlPathPattern).test(actualPath)) {
        return {
          field: 'url',
          label: 'URL path pattern',
          expected: pattern.urlPathPattern,
          actual: actualPath,
        }
      }
    } catch {
      // invalid regex on the mapping side
    }
  }
  return null
}

/**
 * Normalizes a raw journal value for a header/query-param/cookie into a
 * displayable string. WireMock serializes query parameters as
 * `{ key, values: string[] }` objects (not a plain string or array), so
 * that shape is unwrapped in addition to the plain string/array cases.
 */
function normalizeValue(rawActual: unknown): string | undefined {
  if (rawActual === undefined || rawActual === null) return undefined
  if (typeof rawActual === 'string') return rawActual
  if (Array.isArray(rawActual)) return rawActual.join(', ')
  if (typeof rawActual === 'object' && 'values' in rawActual) {
    const values = (rawActual as { values?: unknown }).values
    if (Array.isArray(values)) return values.join(', ')
  }
  return String(rawActual)
}

function checkKeyValueMap(
  actualMap: Record<string, unknown> | undefined,
  expectedMap: Record<string, StringValuePattern> | undefined,
  field: MismatchField,
  labelPrefix: string,
  { caseInsensitiveKeys = false }: { caseInsensitiveKeys?: boolean } = {},
): Mismatch[] {
  if (!expectedMap) return []
  const mismatches: Mismatch[] = []
  const lowercasedActualMap = caseInsensitiveKeys
    ? Object.fromEntries(Object.entries(actualMap ?? {}).map(([k, v]) => [k.toLowerCase(), v]))
    : undefined

  for (const [key, pattern] of Object.entries(expectedMap)) {
    const rawActual = lowercasedActualMap
      ? lowercasedActualMap[key.toLowerCase()]
      : actualMap?.[key]
    const actualValue = normalizeValue(rawActual)
    if (!testStringPattern(pattern, actualValue)) {
      mismatches.push({
        field,
        label: `${labelPrefix} "${key}"`,
        expected: describePattern(pattern),
        actual: actualValue ?? '(absent)',
      })
    }
  }
  return mismatches
}

function checkBody(request: LoggedRequest, pattern: RequestPattern): Mismatch[] {
  if (!pattern.bodyPatterns || pattern.bodyPatterns.length === 0) return []
  // Keep body undefined when genuinely absent — testStringPattern's `absent`
  // branch checks `value === undefined`, so collapsing to '' here would make
  // an { absent: true } pattern always report a mismatch, even when the
  // request truly has no body.
  const body = request.body
  const mismatches: Mismatch[] = []
  for (const bodyPattern of pattern.bodyPatterns) {
    // Only evaluate matchers we can reliably test client-side; skip the rest
    // (equalToJson/matchesJsonPath/matchesXPath/equalToXml) rather than
    // producing a false-positive mismatch.
    const evaluable =
      bodyPattern.equalTo !== undefined ||
      bodyPattern.contains !== undefined ||
      bodyPattern.matches !== undefined ||
      bodyPattern.doesNotMatch !== undefined ||
      bodyPattern.absent !== undefined
    if (!evaluable) continue
    if (!testStringPattern(bodyPattern, body)) {
      mismatches.push({
        field: 'body',
        label: 'Request body',
        expected: describePattern(bodyPattern),
        actual: body ? (body.length > 200 ? `${body.slice(0, 200)}…` : body) : '(empty)',
      })
    }
  }
  return mismatches
}

/**
 * Explains why a logged request didn't match a candidate stub's request
 * pattern, evaluating the same matcher semantics WireMock uses for the
 * matchers we can reliably run client-side. Matchers requiring a JSON/XML/
 * XPath engine (equalToJson, matchesJsonPath, matchesXPath, equalToXml) are
 * skipped rather than guessed at, so they never appear as false mismatches.
 */
export function explainMismatch(request: LoggedRequest, pattern: RequestPattern): Mismatch[] {
  const mismatches: Mismatch[] = []

  if (
    pattern.method !== undefined &&
    pattern.method !== 'ANY' &&
    pattern.method !== request.method
  ) {
    mismatches.push({
      field: 'method',
      label: 'HTTP method',
      expected: pattern.method,
      actual: request.method,
    })
  }

  const urlMismatch = checkUrl(request, pattern)
  if (urlMismatch) mismatches.push(urlMismatch)

  mismatches.push(
    ...checkKeyValueMap(request.headers, pattern.headers, 'header', 'Header', {
      caseInsensitiveKeys: true,
    }),
    ...checkKeyValueMap(
      request.queryParams,
      pattern.queryParameters,
      'queryParameter',
      'Query param',
    ),
    ...checkKeyValueMap(request.cookies, pattern.cookies, 'cookie', 'Cookie'),
    ...checkBody(request, pattern),
  )

  return mismatches
}
