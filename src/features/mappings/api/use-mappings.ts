import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import type { StubMapping } from '@/shared/types/wiremock'
import { useAuditStore } from '@/features/audit/store/audit-store'

export const mappingsKey = (server: ServerConfig | null) => [
  'mappings',
  server?.id,
  server?.baseUrl,
]

export function useMappings(server: ServerConfig | null) {
  return useQuery({
    queryKey: mappingsKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.mappings.list({ limit: 5000 })
    },
    enabled: !!server,
  })
}

export function useMapping(server: ServerConfig | null, id: string | undefined) {
  return useQuery({
    queryKey: ['mapping', server?.id, id],
    queryFn: async () => {
      if (!server || !id) throw new Error('Missing server or mapping id')
      const client = new WireMockClient(server)
      return client.mappings.get(id)
    },
    enabled: !!server && !!id,
  })
}

export function useCreateMapping(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (mapping: StubMapping) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.mappings.create(mapping)
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({ action: 'Created Stub', target: created.name ?? created.id ?? 'mapping' })
      toast.success('Mapping created')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create mapping')
    },
  })
}

export function useUpdateMapping(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async ({ id, mapping }: { id: string; mapping: StubMapping }) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.mappings.update(id, mapping)
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      queryClient.invalidateQueries({ queryKey: ['mapping', server?.id, updated.id] })
      logAction({ action: 'Updated Stub', target: updated.name ?? updated.id ?? 'mapping' })
      toast.success('Mapping updated')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update mapping')
    },
  })
}

export function useDeleteMapping(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (mapping: StubMapping) => {
      if (!server || !mapping.id) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.mappings.remove(mapping.id)
      return mapping
    },
    onSuccess: (mapping) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({ action: 'Deleted Stub', target: mapping.name ?? mapping.id ?? 'mapping' })
      toast.success('Mapping deleted')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete mapping')
    },
  })
}

export function useBulkDeleteMappings(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (mappings: StubMapping[]) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await Promise.all(mappings.filter((m) => m.id).map((m) => client.mappings.remove(m.id!)))
      return mappings
    },
    onSuccess: (mappings) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({ action: 'Deleted Stub', target: `${mappings.length} mappings (bulk)` })
      toast.success(`Deleted ${mappings.length} mapping(s)`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete mappings')
    },
  })
}

export function useImportMappings(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (mappings: StubMapping[]) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.mappings.importMappings(mappings)
      return mappings
    },
    onSuccess: (mappings) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({ action: 'Imported Mappings', target: `${mappings.length} mapping(s)` })
      toast.success(`Imported ${mappings.length} mapping(s)`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to import mappings')
    },
  })
}

export function useSetMappingDisabled(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async ({ mapping, disabled }: { mapping: StubMapping; disabled: boolean }) => {
      if (!server || !mapping.id) throw new Error('No server configured')
      const client = new WireMockClient(server)
      const updated: StubMapping = {
        ...mapping,
        metadata: { ...mapping.metadata, disabled },
      }
      return client.mappings.update(mapping.id, updated)
    },
    onSuccess: (updated, variables) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({
        action: variables.disabled ? 'Disabled Stub' : 'Enabled Stub',
        target: updated.name ?? updated.id ?? 'mapping',
      })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update mapping')
    },
  })
}
