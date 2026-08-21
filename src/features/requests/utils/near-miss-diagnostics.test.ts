import { describe, it, expect } from 'vitest'
import type { LoggedRequest, RequestPattern } from '@/shared/types/wiremock'
import { explainMismatch } from './near-miss-diagnostics'

function request(overrides: Partial<LoggedRequest>): LoggedRequest {
  return {
    url: '/orders',
    method: 'GET',
    ...overrides,
  } as LoggedRequest
}

describe('explainMismatch', () => {
  it('returns no mismatches when the request satisfies the pattern', () => {
    const pattern: RequestPattern = { method: 'GET', urlPath: '/orders' }
    expect(explainMismatch(request({}), pattern)).toEqual([])
  })

  it('flags a method mismatch', () => {
    const pattern: RequestPattern = { method: 'POST', url: '/orders' }
    const mismatches = explainMismatch(request({ method: 'GET' }), pattern)
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'method', expected: 'POST', actual: 'GET' }),
    )
  })

  it('treats ANY method as a wildcard', () => {
    const pattern: RequestPattern = { method: 'ANY', url: '/orders' }
    expect(explainMismatch(request({ method: 'DELETE' }), pattern)).toEqual([])
  })

  it('flags a urlPath mismatch', () => {
    const pattern: RequestPattern = { urlPath: '/customers' }
    const mismatches = explainMismatch(request({ url: '/orders?x=1' }), pattern)
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'url', expected: '/customers', actual: '/orders' }),
    )
  })

  it('flags a urlPathPattern regex mismatch', () => {
    const pattern: RequestPattern = { urlPathPattern: '^/customers/\\d+$' }
    const mismatches = explainMismatch(request({ url: '/orders/42' }), pattern)
    expect(mismatches.some((m) => m.label === 'URL path pattern')).toBe(true)
  })

  it('flags a missing required header', () => {
    const pattern: RequestPattern = {
      headers: { 'X-Api-Key': { equalTo: 'secret' } },
    }
    const mismatches = explainMismatch(request({ headers: {} }), pattern)
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'header', label: 'Header "X-Api-Key"' }),
    )
  })

  it('does not flag a header that matches', () => {
    const pattern: RequestPattern = {
      headers: { 'X-Api-Key': { equalTo: 'secret' } },
    }
    const mismatches = explainMismatch(request({ headers: { 'X-Api-Key': 'secret' } }), pattern)
    expect(mismatches).toEqual([])
  })

  it('flags a query parameter mismatch', () => {
    const pattern: RequestPattern = {
      queryParameters: { status: { equalTo: 'shipped' } },
    }
    const mismatches = explainMismatch(request({ queryParams: { status: 'pending' } }), pattern)
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'queryParameter', expected: 'equalTo: "shipped"' }),
    )
  })

  it('flags an evaluable body pattern mismatch', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ contains: 'urgent' }],
    }
    const mismatches = explainMismatch(request({ body: 'just a routine order' }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ field: 'body' }))
  })

  it('skips body patterns that require a JSON/XML engine, never guessing', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ equalToJson: '{"a":1}' }, { matchesJsonPath: '$.a' }],
    }
    expect(explainMismatch(request({ body: '{"a":2}' }), pattern)).toEqual([])
  })

  it('treats an absent-required header correctly when present', () => {
    const pattern: RequestPattern = {
      headers: { 'X-Debug': { absent: true } },
    }
    const mismatches = explainMismatch(request({ headers: { 'X-Debug': 'true' } }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ label: 'Header "X-Debug"' }))
  })

  it('matches headers case-insensitively by key, like WireMock does', () => {
    const pattern: RequestPattern = {
      headers: { 'X-Api-Key': { equalTo: 'secret' } },
    }
    // the journal may have logged the header under different casing than
    // the stub pattern was authored with
    const mismatches = explainMismatch(request({ headers: { 'x-api-key': 'secret' } }), pattern)
    expect(mismatches).toEqual([])
  })

  it('does not flag a case-insensitive header match on cookies/query params', () => {
    // cookie and query-param names stay case-sensitive
    const pattern: RequestPattern = {
      cookies: { session: { equalTo: 'abc' } },
    }
    const mismatches = explainMismatch(request({ cookies: { Session: 'abc' } }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ label: 'Cookie "session"' }))
  })

  it('unwraps the WireMock { key, values[] } query parameter shape', () => {
    const pattern: RequestPattern = {
      queryParameters: { status: { equalTo: 'shipped' } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: ['shipped'] } } }),
      pattern,
    )
    expect(mismatches).toEqual([])
  })

  it('reports the joined values when a { key, values[] } query param mismatches', () => {
    const pattern: RequestPattern = {
      queryParameters: { status: { equalTo: 'shipped' } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: ['pending'] } } }),
      pattern,
    )
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'queryParameter', actual: 'pending' }),
    )
  })

  it('does not flag an absent body pattern when the request truly has no body', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ absent: true }],
    }
    expect(explainMismatch(request({ body: undefined }), pattern)).toEqual([])
  })

  it('flags an absent body pattern when the request does have a body', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ absent: true }],
    }
    const mismatches = explainMismatch(request({ body: 'hello' }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ field: 'body' }))
  })

  it('matches a multi-valued query param when any single value satisfies the pattern', () => {
    // WireMock matches when ANY value matches, not the values joined together
    const pattern: RequestPattern = {
      queryParameters: { status: { equalTo: 'shipped' } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: ['shipped', 'pending'] } } }),
      pattern,
    )
    expect(mismatches).toEqual([])
  })

  it('matches a multi-valued header when any single value satisfies the pattern', () => {
    const pattern: RequestPattern = {
      headers: { 'X-Tag': { equalTo: 'urgent' } },
    }
    const mismatches = explainMismatch(
      request({ headers: { 'X-Tag': ['low', 'urgent'] } }),
      pattern,
    )
    expect(mismatches).toEqual([])
  })

  it('flags a multi-valued query param when no value satisfies the pattern', () => {
    const pattern: RequestPattern = {
      queryParameters: { status: { equalTo: 'shipped' } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: ['pending', 'cancelled'] } } }),
      pattern,
    )
    expect(mismatches).toContainEqual(
      expect.objectContaining({ field: 'queryParameter', actual: 'pending, cancelled' }),
    )
  })

  it('does not blame the request for an invalid body regex authored on the stub', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ matches: '(unterminated' }],
    }
    expect(explainMismatch(request({ body: 'anything' }), pattern)).toEqual([])
  })

  it('requires a full-string match for "matches", like WireMock does (not a substring)', () => {
    // WireMock (Java Pattern.matches) requires the whole body to match \d+;
    // a JS RegExp.test substring search would wrongly accept this
    const pattern: RequestPattern = {
      bodyPatterns: [{ matches: '\\d+' }],
    }
    const mismatches = explainMismatch(request({ body: 'abc123def' }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ field: 'body' }))
  })

  it('treats "doesNotMatch" as satisfied when the pattern only matches a substring', () => {
    // \d+ is present as a substring but does not match the whole body, so
    // WireMock considers doesNotMatch satisfied (no mismatch)
    const pattern: RequestPattern = {
      bodyPatterns: [{ doesNotMatch: '\\d+' }],
    }
    expect(explainMismatch(request({ body: 'abc123def' }), pattern)).toEqual([])
  })

  it('flags "doesNotMatch" when the pattern fully matches the body', () => {
    const pattern: RequestPattern = {
      bodyPatterns: [{ doesNotMatch: '\\d+' }],
    }
    const mismatches = explainMismatch(request({ body: '12345' }), pattern)
    expect(mismatches).toContainEqual(expect.objectContaining({ field: 'body' }))
  })

  it('requires a full-string match for urlPathPattern', () => {
    const pattern: RequestPattern = { urlPathPattern: '/orders/\\d+' }
    // '/orders/42/extra' contains a substring matching the pattern but is
    // not fully matched by it
    const mismatches = explainMismatch(request({ url: '/orders/42/extra' }), pattern)
    expect(mismatches.some((m) => m.label === 'URL path pattern')).toBe(true)
  })

  it('treats a present-but-empty values array as no value, not a forced mismatch', () => {
    // [].some(...) is always false regardless of the predicate, so an
    // empty values array must be normalized to "absent" rather than
    // forcing a mismatch even for an indeterminate matcher
    const pattern: RequestPattern = {
      queryParameters: { status: { absent: true } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: [] } } }),
      pattern,
    )
    expect(mismatches).toEqual([])
  })

  it('flags absent:true as a mismatch when a non-empty values array is present', () => {
    const pattern: RequestPattern = {
      queryParameters: { status: { absent: true } },
    }
    const mismatches = explainMismatch(
      request({ queryParams: { status: { key: 'status', values: ['shipped'] } } }),
      pattern,
    )
    expect(mismatches).toContainEqual(expect.objectContaining({ field: 'queryParameter' }))
  })
})
