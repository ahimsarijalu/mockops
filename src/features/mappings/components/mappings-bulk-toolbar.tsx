import { EyeIcon, EyeOffIcon, Trash2Icon, XIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function MappingsBulkToolbar({
  selectedCount,
  onClear,
  onDelete,
  onEnable,
  onDisable,
}: {
  selectedCount: number
  onClear: () => void
  onDelete: () => void
  onEnable: () => void
  onDisable: () => void
}) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <Button size="sm" variant="outline" onClick={onEnable}>
        <EyeIcon className="size-3.5" />
        Enable
      </Button>
      <Button size="sm" variant="outline" onClick={onDisable}>
        <EyeOffIcon className="size-3.5" />
        Disable
      </Button>
      <Button size="sm" variant="outline" onClick={onDelete}>
        <Trash2Icon className="size-3.5 text-destructive" />
        Delete
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
        <XIcon className="size-3.5" />
        Clear selection
      </Button>
    </div>
  )
}
