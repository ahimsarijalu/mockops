import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import { useAuditStore } from '@/features/audit/store/audit-store'

const filesKey = (server: ServerConfig | null) => ['files', server?.id, server?.baseUrl]

export function useFiles(server: ServerConfig | null) {
  return useQuery({
    queryKey: filesKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.files.list()
    },
    enabled: !!server,
  })
}

export function useFileContent(server: ServerConfig | null, path: string | undefined) {
  return useQuery({
    queryKey: ['file', server?.id, path],
    queryFn: async () => {
      if (!server || !path) throw new Error('Missing server or file path')
      const client = new WireMockClient(server)
      return client.files.get(path)
    },
    enabled: !!server && !!path,
  })
}

export function useSaveFile(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.files.put(path, content)
      return { path, content }
    },
    onSuccess: ({ path }) => {
      queryClient.invalidateQueries({ queryKey: filesKey(server) })
      queryClient.invalidateQueries({ queryKey: ['file', server?.id, path] })
      logAction({ action: 'Saved File', target: path })
      toast.success('File saved')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save file')
    },
  })
}

export function useDeleteFile(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (path: string) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.files.remove(path)
      return path
    },
    onSuccess: (path) => {
      queryClient.invalidateQueries({ queryKey: filesKey(server) })
      queryClient.removeQueries({ queryKey: ['file', server?.id, path] })
      logAction({ action: 'Deleted File', target: path })
      toast.success('File deleted')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete file')
    },
  })
}
