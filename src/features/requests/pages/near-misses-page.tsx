import { Link } from '@tanstack/react-router'
import { RefreshCwIcon, ServerIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useNearMisses } from '../api/use-requests'
import { NearMissCard } from '../components/near-miss-card'

export function NearMissesPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useNearMisses(server)

  const nearMisses = data ?? []

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
        <ServerIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No active server</p>
          <p className="text-sm text-muted-foreground">
            Add and select a WireMock server to view near misses.
          </p>
        </div>
        <Link to="/servers" className={buttonVariants()}>
          Go to Servers
        </Link>
      </div>
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
