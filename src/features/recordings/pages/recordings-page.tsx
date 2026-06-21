import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CircleIcon, RadioIcon, SquareIcon } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { NoActiveServerState } from '@/shared/components/feedback/no-active-server-state'
import { useActiveServer } from '@/features/servers/store/server-store'
import { HTTP_METHODS } from '@/features/mappings/schemas/matcher-options'
import type { RecordingStartRequest, StubMapping } from '@/shared/types/wiremock'
import {
  useRecordingStatus,
  useSnapshotRecording,
  useStartRecording,
  useStopRecording,
} from '../api/use-recordings'

function statusBadgeVariant(status: string | undefined) {
  if (status === 'Recording') return 'success' as const
  if (status === 'Stopped') return 'secondary' as const
  return 'outline' as const
}

export function RecordingsPage() {
  const server = useActiveServer()
  const { data: status, isLoading } = useRecordingStatus(server)
  const startRecording = useStartRecording(server)
  const stopRecording = useStopRecording(server)
  const snapshot = useSnapshotRecording(server)

  const [targetBaseUrl, setTargetBaseUrl] = useState('')
  const [urlPathPattern, setUrlPathPattern] = useState('')
  const [method, setMethod] = useState<string>('')
  const [persist, setPersist] = useState(true)
  const [repeatsAsScenarios, setRepeatsAsScenarios] = useState(true)
  const [capturedMappings, setCapturedMappings] = useState<StubMapping[] | null>(null)

  if (!server) {
    return (
      <NoActiveServerState description="Add and select a WireMock server to manage recordings." />
    )
  }

  const isRecording = status?.status === 'Recording'

  function buildRequest(): RecordingStartRequest {
    const filters: RecordingStartRequest['filters'] = {}
    if (urlPathPattern.trim()) filters.urlPathPattern = urlPathPattern.trim()
    if (method) filters.method = method

    const request: RecordingStartRequest = {
      persist,
      repeatsAsScenarios,
    }
    if (targetBaseUrl.trim()) request.targetBaseUrl = targetBaseUrl.trim()
    if (Object.keys(filters).length > 0) request.filters = filters
    return request
  }

  function handleStart() {
    startRecording.mutate(buildRequest())
  }

  function handleStop() {
    stopRecording.mutate(undefined, {
      onSuccess: (mappings) => setCapturedMappings(mappings),
    })
  }

  function handleSnapshot() {
    snapshot.mutate(buildRequest(), {
      onSuccess: (mappings) => setCapturedMappings(mappings),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Recordings</h1>
          <p className="text-sm text-muted-foreground">
            Record traffic to {server.name} as new stub mappings.
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <Badge variant={statusBadgeVariant(status?.status)}>
            {isRecording ? (
              <CircleIcon className="size-2.5 fill-current" />
            ) : (
              <RadioIcon className="size-3" />
            )}
            {status?.status ?? 'Unknown'}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recording configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="targetBaseUrl">Target base URL</Label>
              <Input
                id="targetBaseUrl"
                placeholder="https://api.example.com"
                value={targetBaseUrl}
                onChange={(e) => setTargetBaseUrl(e.target.value)}
                disabled={isRecording}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="urlPathPattern">URL path pattern filter</Label>
              <Input
                id="urlPathPattern"
                placeholder="/api/.*"
                value={urlPathPattern}
                onChange={(e) => setUrlPathPattern(e.target.value)}
                disabled={isRecording}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Method filter</Label>
              <Select
                value={method || '__any__'}
                onValueChange={(value) => setMethod(value === '__any__' ? '' : (value ?? ''))}
              >
                <SelectTrigger disabled={isRecording}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any method</SelectItem>
                  {HTTP_METHODS.filter((m) => m !== 'ANY').map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="persist"
                checked={persist}
                onCheckedChange={setPersist}
                disabled={isRecording}
              />
              <Label htmlFor="persist">Persist captured mappings</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="repeatsAsScenarios"
                checked={repeatsAsScenarios}
                onCheckedChange={setRepeatsAsScenarios}
                disabled={isRecording}
              />
              <Label htmlFor="repeatsAsScenarios">Repeated requests as scenarios</Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isRecording ? (
              <Button onClick={handleStop} disabled={stopRecording.isPending} variant="destructive">
                <SquareIcon className="size-4" />
                Stop recording
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={startRecording.isPending}>
                <RadioIcon className="size-4" />
                Start recording
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSnapshot}
              disabled={snapshot.isPending || isRecording}
            >
              Take snapshot
            </Button>
          </div>
        </CardContent>
      </Card>

      {capturedMappings && (
        <Card>
          <CardHeader>
            <CardTitle>Captured mappings ({capturedMappings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {capturedMappings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mappings were captured.</p>
            ) : (
              <div className="space-y-1.5">
                {capturedMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                  >
                    <Badge variant="outline">{mapping.request.method ?? 'ANY'}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                      {mapping.request.url ??
                        mapping.request.urlPath ??
                        mapping.request.urlPattern ??
                        mapping.request.urlPathPattern ??
                        '/'}
                    </span>
                    {mapping.id && (
                      <Link
                        to="/mappings/$mappingId"
                        params={{ mappingId: mapping.id }}
                        className="ml-auto text-primary hover:underline"
                      >
                        {mapping.name || 'View mapping'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
