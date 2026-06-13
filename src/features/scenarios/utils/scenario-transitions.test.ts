import { describe, it, expect } from 'vitest'
import type { StubMapping } from '@/shared/types/wiremock'
import { getScenarioTransitions } from './scenario-transitions'

function mapping(overrides: Partial<StubMapping>): StubMapping {
  return {
    request: { method: 'GET', url: '/' },
    response: { status: 200 },
    ...overrides,
  } as StubMapping
}

describe('getScenarioTransitions', () => {
  it('returns transitions for mappings in the given scenario with a new state', () => {
    const mappings: StubMapping[] = [
      mapping({
        id: '1',
        name: 'Step 1',
        scenarioName: 'login',
        requiredScenarioState: 'Started',
        newScenarioState: 'LoggedIn',
      }),
      mapping({
        id: '2',
        name: 'Other scenario',
        scenarioName: 'other',
        requiredScenarioState: 'Started',
        newScenarioState: 'Done',
      }),
    ]

    const transitions = getScenarioTransitions('login', mappings)
    expect(transitions).toEqual([
      { from: 'Started', to: 'LoggedIn', mappingName: 'Step 1', mappingId: '1' },
    ])
  })

  it('ignores mappings without a newScenarioState', () => {
    const mappings: StubMapping[] = [
      mapping({ id: '1', scenarioName: 'login', requiredScenarioState: 'Started' }),
    ]
    expect(getScenarioTransitions('login', mappings)).toEqual([])
  })

  it('defaults "from" to "(any state)" when no required state is set', () => {
    const mappings: StubMapping[] = [
      mapping({ id: '1', name: 'Step', scenarioName: 'login', newScenarioState: 'LoggedIn' }),
    ]
    expect(getScenarioTransitions('login', mappings)).toEqual([
      { from: '(any state)', to: 'LoggedIn', mappingName: 'Step', mappingId: '1' },
    ])
  })

  it('falls back to the request method when no name is set', () => {
    const mappings: StubMapping[] = [
      mapping({
        id: '1',
        request: { method: 'POST', url: '/login' },
        scenarioName: 'login',
        newScenarioState: 'LoggedIn',
      }),
    ]
    expect(getScenarioTransitions('login', mappings)[0].mappingName).toBe('POST')
  })
})
