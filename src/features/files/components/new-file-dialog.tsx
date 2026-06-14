import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'

interface NewFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (path: string) => void
  existingPaths: string[]
}

export function NewFileDialog({ open, onOpenChange, onCreate, existingPaths }: NewFileDialogProps) {
  const [path, setPath] = useState('')

  const trimmed = path.trim()
  const error = !trimmed
    ? null
    : existingPaths.includes(trimmed)
      ? 'A file with this path already exists'
      : null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPath('')
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New file</DialogTitle>
          <DialogDescription>
            Create a new file under <code>__files</code>. Use forward slashes for subdirectories.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label>File path</Label>
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="responses/user.json"
            className="font-mono"
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={!trimmed || !!error}
            onClick={() => {
              onCreate(trimmed)
              setPath('')
              onOpenChange(false)
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
