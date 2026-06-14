import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import { getStatusBadgeVariant } from '../utils/request-helpers'
import type { ServeEvent } from '@/shared/types/wiremock'

interface RequestDetailSheetProps {
  event: ServeEvent | undefined
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

export function RequestDetailSheet({ event, onOpenChange }: RequestDetailSheetProps) {
  const requestBody = tryFormatBody(event?.request.body)
  const responseBody = tryFormatBody(event?.response?.body)

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
