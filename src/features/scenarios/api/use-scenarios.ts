import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import { useAuditStore } from '@/features/audit/store/audit-store'

const scenariosKey = (server: ServerConfig | null) => ['scenarios', server?.id, server?.baseUrl]

export function useScenarios(server: ServerConfig | null) {
  return useQuery({
    queryKey: scenariosKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.scenarios.list()
    },
    enabled: !!server,
    refetchInterval: 10000,
  })
}

export function useResetAllScenarios(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.scenarios.resetAll()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenariosKey(server) })
      logAction({ action: 'Reset All Scenarios', target: server?.name ?? 'server' })
      toast.success('All scenarios reset')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset scenarios')
    },
  })
}

export function useResetScenario(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (name: string) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.scenarios.reset(name)
      return name
    },
    onSuccess: (name) => {
      queryClient.invalidateQueries({ queryKey: scenariosKey(server) })
      logAction({ action: 'Reset Scenario', target: name })
      toast.success(`Scenario "${name}" reset`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset scenario')
    },
  })
}

export function useSetScenarioState(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async ({ name, state }: { name: string; state: string }) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.scenarios.setState(name, state)
      return { name, state }
    },
    onSuccess: ({ name, state }) => {
      queryClient.invalidateQueries({ queryKey: scenariosKey(server) })
      logAction({ action: 'Set Scenario State', target: `${name} -> ${state}` })
      toast.success(`Scenario "${name}" set to "${state}"`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to set scenario state')
    },
  })
}
