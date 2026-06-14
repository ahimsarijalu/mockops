import { Link } from '@tanstack/react-router'
import {
  ListTreeIcon,
  PauseCircleIcon,
  GitBranchIcon,
  ArrowRightLeftIcon,
  FileTextIcon,
  HistoryIcon,
  AlertTriangleIcon,
  TargetIcon,
  ServerIcon,
} from 'lucide-react'
import { buttonVariants } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useDashboardMetrics } from '../api/use-dashboard-metrics'
import { StatCard } from '../components/stat-card'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { StubCompositionChart } from '../components/stub-composition-chart'

export function DashboardPage() {
  const server = useActiveServer()
  const { data: metrics, isLoading, error } = useDashboardMetrics(server)

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
        <ServerIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No active server</p>
          <p className="text-sm text-muted-foreground">
            Add and select a WireMock server to see live metrics.
          </p>
        </div>
        <Link to="/servers" className={buttonVariants()}>
          Go to Servers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live overview of <span className="font-medium">{server.name}</span>
          </p>
        </div>
        <Badge variant={error ? 'destructive' : 'success'}>
          {error ? 'Disconnected' : 'Connected'}
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-2 py-4 text-sm text-destructive">
            <AlertTriangleIcon className="size-4" />
            {error instanceof Error ? error.message : 'Failed to load metrics'}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total stubs"
          value={metrics?.totalStubs ?? 0}
          icon={ListTreeIcon}
          isLoading={isLoading}
        />
        <StatCard
          title="Disabled stubs"
          value={metrics?.disabledStubs ?? 0}
          icon={PauseCircleIcon}
          isLoading={isLoading}
          tone="warning"
        />
        <StatCard
          title="Scenario stubs"
          value={metrics?.scenarioStubs ?? 0}
          icon={GitBranchIcon}
          isLoading={isLoading}
        />
        <StatCard
          title="Proxy stubs"
          value={metrics?.proxyStubs ?? 0}
          icon={ArrowRightLeftIcon}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Response file stubs"
          value={metrics?.responseFileStubs ?? 0}
          icon={FileTextIcon}
          isLoading={isLoading}
        />
        <StatCard
          title="Total requests"
          value={metrics?.totalRequests ?? 0}
          icon={HistoryIcon}
          isLoading={isLoading}
        />
        <StatCard
          title="Unmatched requests"
          value={metrics?.unmatchedRequests ?? 0}
          icon={AlertTriangleIcon}
          isLoading={isLoading}
          tone="destructive"
        />
        <StatCard
          title="Near misses"
          value={metrics?.nearMisses ?? 0}
          icon={TargetIcon}
          isLoading={isLoading}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics && <RequestVolumeChart events={metrics.recentRequests} />}
        {metrics && <StubCompositionChart metrics={metrics} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Server</CardTitle>
          <CardDescription>{server.baseUrl}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6 text-sm">
          <div>
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">{metrics?.health.online ? 'Online' : 'Offline'}</div>
          </div>
          {metrics?.health.version && (
            <div>
              <div className="text-muted-foreground">Version</div>
              <div className="font-medium">{metrics.health.version}</div>
            </div>
          )}
          <div>
            <div className="text-muted-foreground">Environment</div>
            <div className="font-medium capitalize">{server.environment}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
