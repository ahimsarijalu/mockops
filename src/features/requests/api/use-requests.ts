import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import { useAuditStore } from '@/features/audit/store/audit-store'

const journalKey = (server: ServerConfig | null) => ['requests', server?.id, server?.baseUrl]
const nearMissesKey = (server: ServerConfig | null) => ['near-misses', server?.id, server?.baseUrl]

export function useRequestJournal(server: ServerConfig | null) {
  return useQuery({
    queryKey: journalKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.requests.journal({ limit: 1000 })
    },
    enabled: !!server,
    refetchInterval: 10000,
  })
}

export function useNearMisses(server: ServerConfig | null) {
  return useQuery({
    queryKey: nearMissesKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.requests.nearMisses()
    },
    enabled: !!server,
    refetchInterval: 10000,
  })
}

export function useRemoveServeEvent(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.requests.remove(id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKey(server) })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete request')
    },
  })
}

export function useClearJournal(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.requests.removeAll()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKey(server) })
      logAction({ action: 'Cleared Request Journal', target: server?.name ?? 'server' })
      toast.success('Request journal cleared')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to clear journal')
    },
  })
}
