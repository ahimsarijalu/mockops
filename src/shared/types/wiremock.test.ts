import { describe, it, expect } from 'vitest'
import { stubMappingSchema, stubMappingsResponseSchema } from './wiremock'

describe('stubMappingSchema', () => {
  it('parses a minimal mapping', () => {
    const mapping = stubMappingSchema.parse({
      request: { method: 'GET', url: '/hello' },
      response: { status: 200, jsonBody: { message: 'hi' } },
    })
    expect(mapping.request.method).toBe('GET')
    expect(mapping.response.status).toBe(200)
  })

  it('parses a mapping with matchers, scenario, and metadata', () => {
    const mapping = stubMappingSchema.parse({
      id: 'abc-123',
      name: 'Get user',
      priority: 1,
      scenarioName: 'login-flow',
      requiredScenarioState: 'STARTED',
      newScenarioState: 'LOGGED_IN',
      metadata: { owner: 'team-a' },
      request: {
        method: 'POST',
        urlPathPattern: '/users/.*',
        bodyPatterns: [{ equalToJson: '{"id":1}' }],
        headers: { Authorization: { matches: 'Bearer .*' } },
      },
      response: {
        status: 201,
        bodyFileName: 'responses/user.json',
        fixedDelayMilliseconds: 100,
      },
    })
    expect(mapping.scenarioName).toBe('login-flow')
    expect(mapping.response.bodyFileName).toBe('responses/user.json')
  })
})

describe('stubMappingsResponseSchema', () => {
  it('parses a list response', () => {
    const result = stubMappingsResponseSchema.parse({
      mappings: [{ request: { method: 'GET', url: '/' }, response: { status: 200 } }],
      meta: { total: 1 },
    })
    expect(result.meta?.total).toBe(1)
  })
})
