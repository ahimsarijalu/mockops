import { useMemo } from 'react'
import { RefreshCwIcon, RotateCcwIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NoActiveServerState } from '@/shared/components/feedback/no-active-server-state'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useMappings } from '@/features/mappings/api/use-mappings'
import { useScenarios, useResetAllScenarios } from '../api/use-scenarios'
import { ScenarioCard } from '../components/scenario-card'

export function ScenariosPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useScenarios(server)
  const { data: mappingsData } = useMappings(server)
  const resetAll = useResetAllScenarios(server)

  const scenarios = data ?? []
  const mappings = useMemo(() => mappingsData?.mappings ?? [], [mappingsData])

  if (!server) {
    return (
      <NoActiveServerState description="Add and select a WireMock server to manage scenarios." />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Scenarios</h1>
          <p className="text-sm text-muted-foreground">
            {scenarios.length} scenario{scenarios.length === 1 ? '' : 's'} on {server.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => resetAll.mutate()}
            disabled={scenarios.length === 0 || resetAll.isPending}
          >
            <RotateCcwIcon className="size-4" />
            Reset all
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load scenarios'}
        </div>
      ) : scenarios.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No scenarios defined. Add a scenarioName to a mapping's request to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} mappings={mappings} />
          ))}
        </div>
      )}
    </div>
  )
}
