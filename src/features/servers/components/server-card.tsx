import { useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  CheckCircle2Icon,
  XCircleIcon,
  HelpCircleIcon,
  PencilIcon,
  Trash2Icon,
  RefreshCwIcon,
  StarIcon,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useServerStore } from '../store/server-store'
import { useServerHealth } from '../api/use-server-health'
import type { ServerConfig } from '../types/server'

export function ServerCard({
  server,
  isActive,
  onEdit,
  onDelete,
}: {
  server: ServerConfig
  isActive: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const setActiveServer = useServerStore((s) => s.setActiveServer)
  const updateServer = useServerStore((s) => s.updateServer)
  const queryClient = useQueryClient()
  const { data: health, isFetching, refetch } = useServerHealth(server)

  const status = isFetching ? 'unknown' : health?.online ? 'online' : 'offline'

  // Persist the latest health result to the server store as a side effect,
  // never during render, to avoid write-during-render store updates.
  useEffect(() => {
    if (health && health.online !== (server.lastConnectionStatus === 'online')) {
      updateServer(server.id, {
        lastConnectionStatus: health.online ? 'online' : 'offline',
        lastConnectionAt: new Date().toISOString(),
        version: health.version ?? server.version,
      })
    }
  }, [health, server.id, server.lastConnectionStatus, server.version, updateServer])

  return (
    <Card className={cn(isActive && 'ring-2 ring-primary')}>
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            {server.name}
            {isActive && (
              <Badge variant="secondary" className="gap-1">
                <StarIcon className="size-3" /> Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="mt-1 font-mono text-xs">{server.baseUrl}</CardDescription>
        </div>
        <Badge variant="outline" className="capitalize">
          {server.environment}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {status === 'online' && <CheckCircle2Icon className="size-4 text-success" />}
          {status === 'offline' && <XCircleIcon className="size-4 text-destructive" />}
          {status === 'unknown' && (
            <HelpCircleIcon className="size-4 animate-pulse text-muted-foreground" />
          )}
          <span className="capitalize">{status}</span>
          {health?.version && <span className="text-muted-foreground">v{health.version}</span>}
          {server.lastConnectionAt && (
            <span className="text-muted-foreground">
              · checked{' '}
              {formatDistanceToNow(new Date(server.lastConnectionAt), { addSuffix: true })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isActive && (
            <Button size="sm" variant="secondary" onClick={() => setActiveServer(server.id)}>
              Set active
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              refetch()
              queryClient.invalidateQueries({ queryKey: ['server-health', server.id] })
            }}
          >
            <RefreshCwIcon className={cn('size-3.5', isFetching && 'animate-spin')} />
            Test connection
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit server">
            <PencilIcon className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete server">
            <Trash2Icon className="size-3.5 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
