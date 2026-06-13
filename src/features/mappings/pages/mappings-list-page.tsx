import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { PlusIcon, SearchIcon, ServerIcon, RefreshCwIcon } from 'lucide-react'
import type { RowSelectionState } from '@tanstack/react-table'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
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
import {
  useMappings,
  useCreateMapping,
  useDeleteMapping,
  useBulkDeleteMappings,
  useSetMappingDisabled,
} from '../api/use-mappings'
import { MappingsTable } from '../components/mappings-table'
import { MappingsBulkToolbar } from '../components/mappings-bulk-toolbar'
import { matchesSearch } from '../utils/search'
import type { StubMapping } from '@/shared/types/wiremock'

export function MappingsListPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useMappings(server)
  const createMapping = useCreateMapping(server)
  const deleteMapping = useDeleteMapping(server)
  const bulkDeleteMappings = useBulkDeleteMappings(server)
  const setDisabled = useSetMappingDisabled(server)

  const [search, setSearch] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [deletingMapping, setDeletingMapping] = useState<StubMapping | undefined>(undefined)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const mappings = useMemo(() => data?.mappings ?? [], [data])

  const filtered = useMemo(
    () => mappings.filter((mapping) => matchesSearch(mapping, search)),
    [mappings, search],
  )

  const selectedMappings = useMemo(
    () =>
      filtered.filter(
        (mapping, index) => rowSelection[mapping.id ?? mapping.uuid ?? String(index)],
      ),
    [filtered, rowSelection],
  )

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
        <ServerIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No active server</p>
          <p className="text-sm text-muted-foreground">
            Add and select a WireMock server to manage mappings.
          </p>
        </div>
        <Link to="/servers" className={buttonVariants()}>
          Go to Servers
        </Link>
      </div>
    )
  }

  const handleDuplicate = (mapping: StubMapping) => {
    const { id, uuid, ...rest } = mapping
    void id
    void uuid
    createMapping.mutate({
      ...rest,
      name: rest.name ? `${rest.name} (copy)` : undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mappings</h1>
          <p className="text-sm text-muted-foreground">
            {mappings.length} stub mapping{mappings.length === 1 ? '' : 's'} on {server.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
          <Link to="/mappings/new" className={buttonVariants()}>
            <PlusIcon className="size-4" />
            New mapping
          </Link>
        </div>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, URL, scenario, tags, metadata..."
          className="pl-8"
        />
      </div>

      <MappingsBulkToolbar
        selectedCount={selectedMappings.length}
        onClear={() => setRowSelection({})}
        onDelete={() => setBulkDeleting(true)}
        onEnable={() => {
          selectedMappings.forEach((mapping) => setDisabled.mutate({ mapping, disabled: false }))
          setRowSelection({})
        }}
        onDisable={() => {
          selectedMappings.forEach((mapping) => setDisabled.mutate({ mapping, disabled: true }))
          setRowSelection({})
        }}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load mappings'}
        </div>
      ) : (
        <MappingsTable
          mappings={filtered}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          onDuplicate={handleDuplicate}
          onDelete={(mapping) => setDeletingMapping(mapping)}
          onToggleDisabled={(mapping) => {
            const meta = mapping.metadata as { disabled?: boolean } | undefined
            setDisabled.mutate({ mapping, disabled: !meta?.disabled })
          }}
        />
      )}

      <Dialog
        open={!!deletingMapping}
        onOpenChange={(open) => !open && setDeletingMapping(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete mapping</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingMapping?.name || deletingMapping?.id}"? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingMapping) deleteMapping.mutate(deletingMapping)
                setDeletingMapping(undefined)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleting} onOpenChange={setBulkDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected mappings</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedMappings.length} mapping(s)? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                bulkDeleteMappings.mutate(selectedMappings, {
                  onSuccess: () => setRowSelection({}),
                })
                setBulkDeleting(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
