import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { SearchIcon } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import { getStatusBadgeVariant, isUnmatched } from '../utils/request-helpers'
import { useNearMissesForRequest } from '../api/use-requests'
import { NearMissCard } from './near-miss-card'
import type { ServerConfig } from '@/features/servers/types/server'
import type { ServeEvent } from '@/shared/types/wiremock'

interface RequestDetailSheetProps {
  event: ServeEvent | undefined
  server: ServerConfig | null
  onOpenChange: (open: boolean) => void
}

function tryFormatBody(body: string | undefined): { text: string; language: string } {
  if (!body) return { text: '', language: 'plaintext' }
  try {
    return { text: JSON.stringify(JSON.parse(body), null, 2), language: 'json' }
  } catch {
    return { text: body, language: 'plaintext' }
  }
}

export function RequestDetailSheet({ event, server, onOpenChange }: RequestDetailSheetProps) {
  const requestBody = tryFormatBody(event?.request.body)
  const responseBody = tryFormatBody(event?.response?.body)
  const nearMisses = useNearMissesForRequest(server)

  useEffect(() => {
    nearMisses.reset()
    // Only reset when the selected event changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id])

  return (
    <Sheet open={!!event} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle className="font-mono text-sm">
                {event.request.method} {event.request.url}
              </SheetTitle>
              <SheetDescription>{event.request.loggedDateString}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(event.response?.status)}>
                  {event.response?.status ?? '—'}
                </Badge>
                <Badge variant={event.wasMatched === false ? 'destructive' : 'success'}>
                  {event.wasMatched === false ? 'Unmatched' : 'Matched'}
                </Badge>
                {event.response?.fault && <Badge variant="warning">{event.response.fault}</Badge>}
                {event.stubMapping && (
                  <Link
                    to="/mappings/$mappingId"
                    params={{ mappingId: event.stubMapping.id ?? '' }}
                    className="text-sm text-primary hover:underline"
                  >
                    {event.stubMapping.name || event.stubMapping.id}
                  </Link>
                )}
              </div>

              {isUnmatched(event) && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Near-miss diagnostics</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => nearMisses.mutate(event.request)}
                      disabled={nearMisses.isPending || !server}
                    >
                      <SearchIcon className="size-3.5" />
                      Find near misses
                    </Button>
                  </div>
                  {nearMisses.isPending && (
                    <p className="text-xs text-muted-foreground">Searching…</p>
                  )}
                  {nearMisses.data && nearMisses.data.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No near-miss stubs found for this request.
                    </p>
                  )}
                  {nearMisses.data && nearMisses.data.length > 0 && (
                    <div className="space-y-2">
                      {nearMisses.data.map((nearMiss, i) => (
                        <NearMissCard key={i} nearMiss={nearMiss} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {event.timing && (
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  {event.timing.totalTime !== undefined && (
                    <div>Total: {event.timing.totalTime}ms</div>
                  )}
                  {event.timing.addedDelay !== undefined && (
                    <div>Added delay: {event.timing.addedDelay}ms</div>
                  )}
                  {event.timing.processTime !== undefined && (
                    <div>Process: {event.timing.processTime}ms</div>
                  )}
                </div>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Request headers</h3>
                <MonacoJsonEditor
                  value={JSON.stringify(event.request.headers ?? {}, null, 2)}
                  onChange={() => {}}
                  language="json"
                  height={140}
                  readOnly
                />
              </section>

              {requestBody.text && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Request body</h3>
                  <MonacoJsonEditor
                    value={requestBody.text}
                    onChange={() => {}}
                    language={requestBody.language}
                    height={200}
                    readOnly
                  />
                </section>
              )}

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Response headers</h3>
                <MonacoJsonEditor
                  value={JSON.stringify(event.response?.headers ?? {}, null, 2)}
                  onChange={() => {}}
                  language="json"
                  height={140}
                  readOnly
                />
              </section>

              {responseBody.text && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Response body</h3>
                  <MonacoJsonEditor
                    value={responseBody.text}
                    onChange={() => {}}
                    language={responseBody.language}
                    height={200}
                    readOnly
                  />
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
