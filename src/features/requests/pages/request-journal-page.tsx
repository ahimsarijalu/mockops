import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { RefreshCwIcon, SearchIcon, ServerIcon, Trash2Icon } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useRequestJournal, useRemoveServeEvent, useClearJournal } from '../api/use-requests'
import { RequestJournalTable } from '../components/request-journal-table'
import { RequestDetailSheet } from '../components/request-detail-sheet'
import { matchesRequestSearch, isUnmatched } from '../utils/request-helpers'
import type { ServeEvent } from '@/shared/types/wiremock'

type MatchFilter = 'all' | 'matched' | 'unmatched'

export function RequestJournalPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useRequestJournal(server)
  const removeEvent = useRemoveServeEvent(server)
  const clearJournal = useClearJournal(server)

  const [search, setSearch] = useState('')
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('all')
  const [selectedEvent, setSelectedEvent] = useState<ServeEvent | undefined>(undefined)
  const [clearing, setClearing] = useState(false)

  const events = useMemo(() => data?.requests ?? [], [data])

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (matchFilter === 'matched' && isUnmatched(event)) return false
      if (matchFilter === 'unmatched' && !isUnmatched(event)) return false
      return matchesRequestSearch(event, search)
    })
  }, [events, search, matchFilter])

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
        <ServerIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No active server</p>
          <p className="text-sm text-muted-foreground">
            Add and select a WireMock server to view the request journal.
          </p>
        </div>
        <Link to="/servers" className={buttonVariants()}>
          Go to Servers
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Request Journal</h1>
          <p className="text-sm text-muted-foreground">
            {events.length} request{events.length === 1 ? '' : 's'} on {server.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => setClearing(true)}
            disabled={events.length === 0}
          >
            <Trash2Icon className="size-4 text-destructive" />
            Clear journal
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL, method, status, stub name..."
            className="pl-8"
          />
        </div>
        <Select value={matchFilter} onValueChange={(value) => setMatchFilter(value as MatchFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All requests</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load request journal'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No requests found.
        </div>
      ) : (
        <RequestJournalTable
          events={filtered}
          onSelect={setSelectedEvent}
          onDelete={(event) => removeEvent.mutate(event.id)}
        />
      )}

      <RequestDetailSheet
        event={selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(undefined)}
      />

      <Dialog open={clearing} onOpenChange={setClearing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear request journal</DialogTitle>
            <DialogDescription>
              This will permanently delete all {events.length} logged request(s) from this server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                clearJournal.mutate()
                setClearing(false)
              }}
            >
              Clear journal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
