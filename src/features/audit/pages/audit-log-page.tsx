import { useMemo, useState } from 'react'
import { Trash2Icon } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { useAuditStore } from '../store/audit-store'

export function AuditLogPage() {
  const entries = useAuditStore((s) => s.entries)
  const clear = useAuditStore((s) => s.clear)
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (entry) =>
        entry.action.toLowerCase().includes(q) ||
        entry.target.toLowerCase().includes(q) ||
        (entry.serverName ?? '').toLowerCase().includes(q),
    )
  }, [entries, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} action{entries.length === 1 ? '' : 's'} recorded locally in this
            browser.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setConfirmClear(true)}
          disabled={entries.length === 0}
        >
          <Trash2Icon className="size-4" />
          Clear log
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by action or target..."
      />

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {entries.length === 0
            ? 'No actions recorded yet. Changes you make will appear here.'
            : 'No entries match your search.'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.action}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{entry.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear audit log</DialogTitle>
            <DialogDescription>
              This removes all locally recorded audit entries. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                clear()
                setConfirmClear(false)
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
