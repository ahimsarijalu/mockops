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

function checkKeyValueMap(
  actualMap: Record<string, unknown> | undefined,
  expectedMap: Record<string, StringValuePattern> | undefined,
  field: MismatchField,
  labelPrefix: string,
): Mismatch[] {
  if (!expectedMap) return []
  const mismatches: Mismatch[] = []
  for (const [key, pattern] of Object.entries(expectedMap)) {
    const rawActual = actualMap?.[key]
    const actualValue = Array.isArray(rawActual) ? rawActual.join(', ') : (rawActual as string)
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
  const body = request.body ?? ''
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
        actual: body.length > 200 ? `${body.slice(0, 200)}…` : body || '(empty)',
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
    ...checkKeyValueMap(request.headers, pattern.headers, 'header', 'Header'),
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
