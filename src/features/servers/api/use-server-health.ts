import { useQuery } from '@tanstack/react-query'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '../types/server'

export interface ServerHealth {
  online: boolean
  version?: string
  uptime?: number
  status?: string
}

export function useServerHealth(server: ServerConfig | null) {
  return useQuery<ServerHealth>({
    queryKey: ['server-health', server?.id, server?.baseUrl],
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      try {
        const health = await client.system.health()
        return {
          online: true,
          version: health.version,
          uptime: health.uptime,
          status: health.status,
        }
      } catch {
        // Fallback for WireMock versions without /__admin/health
        await client.mappings.list({ limit: 1 })
        return { online: true }
      }
    },
    enabled: !!server,
    retry: false,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}
