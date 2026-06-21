import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NoActiveServerState } from '@/shared/components/feedback/no-active-server-state'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useNearMisses } from '../api/use-requests'
import { NearMissCard } from '../components/near-miss-card'

export function NearMissesPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useNearMisses(server)

  const nearMisses = data ?? []

  if (!server) {
    return (
      <NoActiveServerState description="Add and select a WireMock server to view near misses." />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Near Misses</h1>
          <p className="text-sm text-muted-foreground">
            Unmatched requests with the closest-matching stub mappings on {server.name}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCwIcon className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load near misses'}
        </div>
      ) : nearMisses.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No near misses recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {nearMisses.map((nearMiss, index) => (
            <NearMissCard key={index} nearMiss={nearMiss} />
          ))}
        </div>
      )}
    </div>
  )
}
