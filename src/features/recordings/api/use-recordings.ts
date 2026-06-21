import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WireMockClient } from '@/shared/api/wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'
import type { RecordingStartRequest } from '@/shared/types/wiremock'
import { useAuditStore } from '@/features/audit/store/audit-store'
import { mappingsKey } from '@/features/mappings/api/use-mappings'

const recordingStatusKey = (server: ServerConfig | null) => [
  'recording-status',
  server?.id,
  server?.baseUrl,
]

export function useRecordingStatus(server: ServerConfig | null) {
  return useQuery({
    queryKey: recordingStatusKey(server),
    queryFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.recordings.status()
    },
    enabled: !!server,
    refetchInterval: 5000,
  })
}

export function useStartRecording(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (request: RecordingStartRequest) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      await client.recordings.start(request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recordingStatusKey(server) })
      logAction({ action: 'Started Recording', target: server?.name ?? 'server' })
      toast.success('Recording started')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to start recording')
    },
  })
}

export function useStopRecording(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async () => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.recordings.stop()
    },
    onSuccess: (mappings) => {
      queryClient.invalidateQueries({ queryKey: recordingStatusKey(server) })
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({
        action: 'Stopped Recording',
        target: `${mappings.length} mapping${mappings.length === 1 ? '' : 's'} captured`,
      })
      toast.success(`Recording stopped: ${mappings.length} mapping(s) captured`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to stop recording')
    },
  })
}

export function useSnapshotRecording(server: ServerConfig | null) {
  const queryClient = useQueryClient()
  const logAction = useAuditStore((s) => s.log)
  return useMutation({
    mutationFn: async (request?: RecordingStartRequest) => {
      if (!server) throw new Error('No server configured')
      const client = new WireMockClient(server)
      return client.recordings.snapshot(request)
    },
    onSuccess: (mappings) => {
      queryClient.invalidateQueries({ queryKey: mappingsKey(server) })
      logAction({
        action: 'Took Snapshot',
        target: `${mappings.length} mapping${mappings.length === 1 ? '' : 's'} captured`,
      })
      toast.success(`Snapshot complete: ${mappings.length} mapping(s) captured`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to take snapshot')
    },
  })
}
