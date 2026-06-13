import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Trash2Icon } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import type { ServeEvent } from '@/shared/types/wiremock'
import { getStatusBadgeVariant } from '../utils/request-helpers'

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  POST: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

interface RequestJournalTableProps {
  events: ServeEvent[]
  onSelect: (event: ServeEvent) => void
  onDelete: (event: ServeEvent) => void
}

export function RequestJournalTable({ events, onSelect, onDelete }: RequestJournalTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0
  const paddingBottom =
    virtualRows.length > 0
      ? virtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0

  return (
    <div ref={parentRef} className="max-h-[70vh] overflow-auto rounded-md border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Matched stub</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const event = events[virtualRow.index]
            const method = event.request.method
            return (
              <TableRow key={event.id} className="cursor-pointer" onClick={() => onSelect(event)}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {event.request.loggedDateString ?? '—'}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex rounded px-1.5 py-0.5 text-xs font-mono font-semibold',
                      methodColors[method] ?? 'bg-muted text-muted-foreground',
                    )}
                  >
                    {method}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate font-mono text-xs text-muted-foreground">
                  {event.request.url}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(event.response?.status)}>
                    {event.response?.status ?? '—'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-xs">
                  {event.stubMapping ? (
                    event.stubMapping.name || event.stubMapping.id
                  ) : (
                    <span className="text-muted-foreground">unmatched</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete request"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(event)
                    }}
                  >
                    <Trash2Icon className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
