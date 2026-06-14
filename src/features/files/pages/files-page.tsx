import { useMemo, useState } from 'react'
import { PlusIcon, RefreshCwIcon, SearchIcon, ServerIcon, FolderTreeIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useMappings } from '@/features/mappings/api/use-mappings'
import { useFiles, useSaveFile } from '../api/use-files'
import { buildFileTree } from '../utils/file-tree'
import { FileTree } from '../components/file-tree'
import { FileEditorPanel } from '../components/file-editor-panel'
import { NewFileDialog } from '../components/new-file-dialog'

export function FilesPage() {
  const server = useActiveServer()
  const { data, isLoading, error, refetch, isFetching } = useFiles(server)
  const { data: mappingsData } = useMappings(server)
  const saveFile = useSaveFile(server)

  const [search, setSearch] = useState('')
  const [selectedPath, setSelectedPath] = useState<string | undefined>(undefined)
  const [newFileOpen, setNewFileOpen] = useState(false)

  const paths = useMemo(() => data ?? [], [data])

  const filteredPaths = useMemo(
    () => (search ? paths.filter((p) => p.toLowerCase().includes(search.toLowerCase())) : paths),
    [paths, search],
  )

  const tree = useMemo(() => buildFileTree(filteredPaths), [filteredPaths])

  const referencingMappings = useMemo(() => {
    if (!selectedPath) return []
    return (mappingsData?.mappings ?? []).filter((m) => m.response.bodyFileName === selectedPath)
  }, [mappingsData, selectedPath])

  if (!server) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
        <ServerIcon className="size-10 text-muted-foreground" />
        <div>
          <p className="font-medium">No active server</p>
          <p className="text-sm text-muted-foreground">
            Add and select a WireMock server to manage files.
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
          <h1 className="text-xl font-semibold">Files</h1>
          <p className="text-sm text-muted-foreground">
            {paths.length} file{paths.length === 1 ? '' : 's'} under __files on {server.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCwIcon className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
            Refresh
          </Button>
          <Button onClick={() => setNewFileOpen(true)}>
            <PlusIcon className="size-4" />
            New file
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load files'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2 rounded-md border border-border p-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="pl-8"
              />
            </div>
            {tree.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No files found</p>
            ) : (
              <div className="max-h-[600px] overflow-auto">
                <FileTree nodes={tree} selectedPath={selectedPath} onSelect={setSelectedPath} />
              </div>
            )}
          </div>

          <div className="rounded-md border border-border p-4">
            {selectedPath ? (
              <FileEditorPanel
                server={server}
                path={selectedPath}
                referencingMappings={referencingMappings}
                onDeleted={() => setSelectedPath(undefined)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
                <FolderTreeIcon className="size-10" />
                <p>Select a file to view and edit its contents.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <NewFileDialog
        open={newFileOpen}
        onOpenChange={setNewFileOpen}
        existingPaths={paths}
        onCreate={(path) => {
          saveFile.mutate({ path, content: '' }, { onSuccess: () => setSelectedPath(path) })
        }}
      />
    </div>
  )
}
