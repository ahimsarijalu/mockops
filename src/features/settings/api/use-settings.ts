import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import type { WireMockSettings } from '@/shared/types/wiremock'
import { useAuditStore } from '@/features/audit/store/audit-store'
import { mappingsKey } from '@/features/mappings/api/use-mappings'

const settingsKey = (server: ServerConfig | null) => ['settings', server?.id, server?.baseUrl]

export function useGlobalSettings(server: ServerConfig | null) {
  return useQuery({
    queryKey: settingsKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.system.getSettings()
    },
    enabled: !!server,
  })
}

export function useUpdateGlobalSettings(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (settings: WireMockSettings) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.system.updateSettings(settings)
      return settings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey(server) })
      logAction({ action: 'Updated Global Settings', target: server?.name ?? 'server' })
      toast.success('Global settings updated')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    },
  })
}

export function usePersistMappings(server: ServerConfig | null) {
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.mappings.persist()
    },
    onSuccess: () => {
      logAction({ action: 'Saved Mappings to Disk', target: server?.name ?? 'server' })
      toast.success('Mappings saved to disk')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save mappings')
    },
  })
}

export function useResetMappingsToDefault(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.mappings.resetToDefault()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({ action: 'Reset Mappings to Default', target: server?.name ?? 'server' })
      toast.success('Mappings reset to default')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset mappings')
    },
  })
}

export function useResetServerState(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.system.resetAll()
    },
    onSuccess: () => {
      // Every query key is scoped with the server id, so only refetch queries
      // belonging to the server being reset rather than churning every server.
      queryClient.invalidateQueries({
        predicate: (query) => !!server && query.queryKey.includes(server.id),
      })
      logAction({ action: 'Reset Server State', target: server?.name ?? 'server' })
      toast.success('Server state reset')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to reset server')
    },
  })
}
