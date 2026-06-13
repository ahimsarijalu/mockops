import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, RotateCcwIcon } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { cn } from '@/shared/lib/utils'
import type { Scenario, StubMapping } from '@/shared/types/wiremock'
import { getScenarioTransitions } from '../utils/scenario-transitions'
import { useResetScenario, useSetScenarioState } from '../api/use-scenarios'
import { useActiveServer } from '@/features/servers/store/server-store'

interface ScenarioCardProps {
  scenario: Scenario
  mappings: StubMapping[]
}

export function ScenarioCard({ scenario, mappings }: ScenarioCardProps) {
  const server = useActiveServer()
  const resetScenario = useResetScenario(server)
  const setScenarioState = useSetScenarioState(server)
  const transitions = getScenarioTransitions(scenario.name, mappings)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>{scenario.name}</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={() => resetScenario.mutate(scenario.name)}
          disabled={resetScenario.isPending}
        >
          <RotateCcwIcon className="size-3.5" />
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Current state:</span>
          <Badge>{scenario.state}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Set state:</span>
          <Select
            value={scenario.state}
            onValueChange={(state) =>
              state && setScenarioState.mutate({ name: scenario.name, state })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenario.possibleStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {scenario.possibleStates.length > 0 && (
          <div>
            <p className="mb-1.5 text-sm font-medium">Possible states</p>
            <div className="flex flex-wrap gap-2">
              {scenario.possibleStates.map((state) => (
                <Badge
                  key={state}
                  variant={state === scenario.state ? 'default' : 'outline'}
                  className={cn(state === scenario.state && 'ring-2 ring-primary/40')}
                >
                  {state}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {transitions.length > 0 && (
          <div>
            <p className="mb-1.5 text-sm font-medium">Transitions</p>
            <div className="space-y-1.5">
              {transitions.map((transition, index) => (
                <div
                  key={index}
                  className="flex flex-wrap items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs"
                >
                  <Badge variant="outline">{transition.from}</Badge>
                  <ArrowRightIcon className="size-3 text-muted-foreground" />
                  <Badge variant="outline">{transition.to}</Badge>
                  <span className="text-muted-foreground">via</span>
                  {transition.mappingId ? (
                    <Link
                      to="/mappings/$mappingId"
                      params={{ mappingId: transition.mappingId }}
                      className="text-primary hover:underline"
                    >
                      {transition.mappingName}
                    </Link>
                  ) : (
                    <span>{transition.mappingName}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
