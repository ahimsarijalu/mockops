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

export interface BulkDeleteResult {
  requested: StubMapping[]
  succeeded: StubMapping[]
  failed: { mapping: StubMapping; error: unknown }[]
}

export function useBulkDeleteMappings(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (mappings: StubMapping[]): Promise<BulkDeleteResult> => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      // A mapping is deletable by either id or uuid (WireMock accepts
      // either as the {id} path segment). One lacking both can't be
      // targeted at all — report it as failed rather than silently
      // dropping it from the batch, which would otherwise vanish from the
      // selection without ever being deleted or counted.
      const succeeded: StubMapping[] = []
      const failed: BulkDeleteResult['failed'] = []
      const deletable: { mapping: StubMapping; key: string }[] = []
      for (const mapping of mappings) {
        const key = mapping.id ?? mapping.uuid
        if (key) {
          deletable.push({ mapping, key })
        } else {
          failed.push({ mapping, error: new Error('Mapping has no id or uuid') })
        }
      }
      const results = await Promise.allSettled(
        deletable.map(({ key }) => client.mappings.remove(key)),
      )
      results.forEach((result, index) => {
        const { mapping } = deletable[index]
        if (result.status === 'fulfilled') {
          succeeded.push(mapping)
        } else {
          failed.push({ mapping, error: result.reason })
        }
      })
      return { requested: mappings, succeeded, failed }
    },
    onSuccess: ({ succeeded, failed }) => {
      // Always invalidate: even a fully-failed batch may have partially
      // mutated server state before a later request in the batch failed.
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      if (succeeded.length > 0) {
        logAction({ action: 'Deleted Stub', target: `${succeeded.length} mappings (bulk)` })
      }
      if (failed.length === 0) {
        toast.success(`Deleted ${succeeded.length} mapping(s)`)
      } else if (succeeded.length === 0) {
        toast.error(`Failed to delete ${failed.length} mapping(s)`)
      } else {
        toast.warning(
          `Deleted ${succeeded.length} mapping(s), but ${failed.length} failed to delete`,
        )
      }
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
