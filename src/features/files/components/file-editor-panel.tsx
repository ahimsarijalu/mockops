import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { SaveIcon, Trash2Icon, FileIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Badge } from '@/shared/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import { useFileContent, useSaveFile, useDeleteFile } from '../api/use-files'
import { getFileLanguage } from '../utils/file-tree'
import type { ServerConfig } from '@/features/servers/types/server'
import type { StubMapping } from '@/shared/types/wiremock'

interface FileEditorPanelProps {
  server: ServerConfig | null
  path: string
  referencingMappings: StubMapping[]
  onDeleted: () => void
}

export function FileEditorPanel({
  server,
  path,
  referencingMappings,
  onDeleted,
}: FileEditorPanelProps) {
  const { data, isLoading, error } = useFileContent(server, path)
  const saveFile = useSaveFile(server)
  const deleteFile = useDeleteFile(server)

  const [content, setContent] = useState<string | null>(null)
  const [loadedPath, setLoadedPath] = useState<string | undefined>(undefined)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (data !== undefined && (path !== loadedPath || content === null)) {
    setContent(data)
    setLoadedPath(path)
  }

  const isDirty = content !== null && content !== data

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
        {error instanceof Error ? error.message : 'Failed to load file'}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-mono text-sm">{path}</span>
          {isDirty && <Badge variant="secondary">Unsaved</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => content !== null && saveFile.mutate({ path, content })}
            disabled={!isDirty || saveFile.isPending}
          >
            <SaveIcon className="size-3.5" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmDelete(true)}>
            <Trash2Icon className="size-3.5 text-destructive" />
            Delete
          </Button>
        </div>
      </div>

      {referencingMappings.length > 0 && (
        <div className="rounded-md border border-border p-3 text-sm">
          <p className="mb-2 font-medium">
            Referenced by {referencingMappings.length} mapping
            {referencingMappings.length === 1 ? '' : 's'}
          </p>
          <div className="flex flex-wrap gap-2">
            {referencingMappings.map((mapping) => (
              <Link
                key={mapping.id}
                to="/mappings/$mappingId"
                params={{ mappingId: mapping.id ?? '' }}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-accent"
              >
                {mapping.name || mapping.id}
              </Link>
            ))}
          </div>
        </div>
      )}

      <MonacoJsonEditor
        value={content ?? ''}
        onChange={setContent}
        language={getFileLanguage(path)}
        height={500}
      />

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{path}"? This cannot be undone.
              {referencingMappings.length > 0 && (
                <>
                  {' '}
                  It is referenced by {referencingMappings.length} mapping
                  {referencingMappings.length === 1 ? '' : 's'}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                deleteFile.mutate(path, { onSuccess: onDeleted })
                setConfirmDelete(false)
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
