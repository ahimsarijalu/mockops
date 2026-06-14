import { describe, it, expect } from 'vitest'
import type { ServeEvent } from '@/shared/types/wiremock'
import { getStatusBadgeVariant, isUnmatched, matchesRequestSearch } from './request-helpers'

function event(overrides: Partial<ServeEvent>): ServeEvent {
  return {
    id: '1',
    request: { url: '/hello', method: 'GET' },
    response: { status: 200 },
    wasMatched: true,
    ...overrides,
  } as ServeEvent
}

describe('getStatusBadgeVariant', () => {
  it('returns secondary for undefined status', () => {
    expect(getStatusBadgeVariant(undefined)).toBe('secondary')
  })

  it('returns success for 2xx/3xx', () => {
    expect(getStatusBadgeVariant(200)).toBe('success')
    expect(getStatusBadgeVariant(304)).toBe('success')
  })

  it('returns warning for 4xx', () => {
    expect(getStatusBadgeVariant(404)).toBe('warning')
  })

  it('returns destructive for 5xx', () => {
    expect(getStatusBadgeVariant(500)).toBe('destructive')
  })
})

describe('isUnmatched', () => {
  it('returns true when wasMatched is false', () => {
    expect(isUnmatched(event({ wasMatched: false }))).toBe(true)
  })

  it('returns true when there is no stub mapping', () => {
    expect(isUnmatched(event({ wasMatched: true, stubMapping: undefined }))).toBe(true)
  })

  it('returns false when matched with a stub mapping', () => {
    expect(isUnmatched(event({ wasMatched: true, stubMapping: { id: 'abc' } as never }))).toBe(
      false,
    )
  })
})

describe('matchesRequestSearch', () => {
  it('matches on URL', () => {
    expect(
      matchesRequestSearch(event({ request: { url: '/users/1', method: 'GET' } }), 'users'),
    ).toBe(true)
  })

  it('is case-insensitive and matches multiple AND terms', () => {
    const e = event({ request: { url: '/Users/1', method: 'POST' } })
    expect(matchesRequestSearch(e, 'users post')).toBe(true)
    expect(matchesRequestSearch(e, 'users delete')).toBe(false)
  })

  it('returns true for an empty query', () => {
    expect(matchesRequestSearch(event({}), '   ')).toBe(true)
  })

  it('matches on stub mapping name and response status', () => {
    const e = event({ stubMapping: { name: 'Get user' } as never, response: { status: 404 } })
    expect(matchesRequestSearch(e, 'get user 404')).toBe(true)
  })
})
