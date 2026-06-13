import type { StubMapping } from '@/shared/types/wiremock'

export interface ScenarioTransition {
  from: string
  to: string
  mappingName: string
  mappingId?: string
}

export function getScenarioTransitions(
  scenarioName: string,
  mappings: StubMapping[],
): ScenarioTransition[] {
  return mappings
    .filter((m) => m.scenarioName === scenarioName && m.newScenarioState)
    .map((m) => ({
      from: m.requiredScenarioState ?? '(any state)',
      to: m.newScenarioState as string,
      mappingName: m.name || m.request.method || 'mapping',
      mappingId: m.id,
    }))
}
