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

/**
 * WireMock's regex matchers (matches/doesNotMatch/urlPattern/urlPathPattern)
 * use Java's Pattern.matches semantics, which requires the ENTIRE string to
 * match — unlike JS RegExp.test, which succeeds on any substring. Anchor to
 * the full string so client-side semantics line up with WireMock's.
 * Returns null (indeterminate) for an invalid regex rather than throwing —
 * a malformed matcher authored on the stub is never the request's fault.
 */
function regexFullMatch(patternSource: string, value: string): boolean | null {
  try {
    return new RegExp(`^(?:${patternSource})$`).test(value)
  } catch {
    return null
  }
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
    // Invalid/indeterminate regex is never blamed on the request.
    return regexFullMatch(pattern.matches, v) ?? true
  }
  if (pattern.doesNotMatch !== undefined) {
    const result = regexFullMatch(pattern.doesNotMatch, v)
    return result === null ? true : !result
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
    if (regexFullMatch(pattern.urlPattern, actual) === false) {
      return { field: 'url', label: 'URL pattern', expected: pattern.urlPattern, actual }
    }
  }
  if (pattern.urlPathPattern !== undefined) {
    const actualPath = actual.split('?')[0]
    if (regexFullMatch(pattern.urlPathPattern, actualPath) === false) {
      return {
        field: 'url',
        label: 'URL path pattern',
        expected: pattern.urlPathPattern,
        actual: actualPath,
      }
    }
  }
  return null
}

/**
 * Splits a raw journal value for a header/query-param/cookie into its
 * individual string values. WireMock serializes query parameters as
 * `{ key, values: string[] }` objects (not a plain string or array), so
 * that shape is unwrapped in addition to the plain string/array cases.
 */
function getValues(rawActual: unknown): string[] | undefined {
  if (rawActual === undefined || rawActual === null) return undefined
  if (typeof rawActual === 'string') return [rawActual]
  if (Array.isArray(rawActual)) return rawActual.map(String)
  if (typeof rawActual === 'object' && 'values' in rawActual) {
    const values = (rawActual as { values?: unknown }).values
    if (Array.isArray(values)) return values.map(String)
  }
  return [String(rawActual)]
}

/**
 * WireMock matches a multi-valued header/query-param field when ANY one of
 * its values satisfies the matcher, not when the values joined together do.
 * An empty values array (present key, no values) is treated the same as no
 * value at all — [].some(...) is always false regardless of the predicate,
 * which would otherwise force a mismatch even for an indeterminate matcher.
 */
function matchesAnyValue(pattern: StringValuePattern, values: string[] | undefined): boolean {
  const nonEmptyValues = values && values.length > 0 ? values : undefined
  if (pattern.absent !== undefined) {
    return pattern.absent ? nonEmptyValues === undefined : nonEmptyValues !== undefined
  }
  if (nonEmptyValues === undefined) return testStringPattern(pattern, undefined)
  return nonEmptyValues.some((v) => testStringPattern(pattern, v))
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
    const values = getValues(rawActual)
    if (!matchesAnyValue(pattern, values)) {
      mismatches.push({
        field,
        label: `${labelPrefix} "${key}"`,
        expected: describePattern(pattern),
        actual: values?.join(', ') ?? '(absent)',
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
