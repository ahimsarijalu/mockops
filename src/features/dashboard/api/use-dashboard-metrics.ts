import { useQuery } from '@tanstack/react-query'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import type { StubMapping, ServeEvent } from '@/shared/types/wiremock'

export interface DashboardMetrics {
  totalStubs: number
  disabledStubs: number
  scenarioStubs: number
  proxyStubs: number
  responseFileStubs: number
  totalRequests: number
  unmatchedRequests: number
  nearMisses: number
  health: { online: boolean; version?: string; status?: string }
  recentRequests: ServeEvent[]
}

function isDisabled(mapping: StubMapping): boolean {
  const meta = mapping.metadata as { disabled?: boolean } | undefined
  return meta?.disabled === true
}

export function useDashboardMetrics(server: ServerConfig | null) {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics', server?.id, server?.baseUrl],
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)

      const [mappingsRes, journalRes, nearMissesRes, healthRes] = await Promise.all([
        client.mappings.list({ limit: 1000 }),
        client.requests.journal({ limit: 50 }).catch(() => ({ requests: [] as ServeEvent[] })),
        client.requests.nearMisses().catch(() => []),
        client.system.health().catch(() => null),
      ])

      const mappings = mappingsRes.mappings
      const totalStubs = mappingsRes.meta?.total ?? mappings.length
      const disabledStubs = mappings.filter(isDisabled).length
      const scenarioStubs = mappings.filter((m) => !!m.scenarioName).length
      const proxyStubs = mappings.filter((m) => !!m.response.proxyBaseUrl).length
      const responseFileStubs = mappings.filter((m) => !!m.response.bodyFileName).length

      const requests = journalRes.requests
      const unmatchedRequests = requests.filter((r) => r.wasMatched === false).length

      return {
        totalStubs,
        disabledStubs,
        scenarioStubs,
        proxyStubs,
        responseFileStubs,
        totalRequests: requests.length,
        unmatchedRequests,
        nearMisses: nearMissesRes.length,
        health: healthRes
          ? { online: true, version: healthRes.version, status: healthRes.status }
          : { online: true },
        recentRequests: requests.slice(0, 10),
      }
    },
    enabled: !!server,
    refetchInterval: 15_000,
  })
}
