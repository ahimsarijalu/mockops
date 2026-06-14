import { useRef } from 'react'
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link } from '@tanstack/react-router'
import {
  EyeOffIcon,
  EyeIcon,
  PencilIcon,
  CopyIcon,
  Trash2Icon,
  GitBranchIcon,
  ArrowRightLeftIcon,
  FileTextIcon,
} from 'lucide-react'
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
import type { StubMapping } from '@/shared/types/wiremock'
import {
  getMappingKind,
  getMappingStatusCode,
  getMappingTags,
  getMappingUrl,
  isMappingDisabled,
} from '../utils/mapping-helpers'

interface MappingsTableProps {
  mappings: StubMapping[]
  rowSelection: RowSelectionState
  onRowSelectionChange: (state: RowSelectionState) => void
  onDuplicate: (mapping: StubMapping) => void
  onDelete: (mapping: StubMapping) => void
  onToggleDisabled: (mapping: StubMapping) => void
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  POST: 'bg-green-500/15 text-green-600 dark:text-green-400',
  PUT: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  PATCH: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export function MappingsTable({
  mappings,
  rowSelection,
  onRowSelectionChange,
  onDuplicate,
  onDelete,
  onToggleDisabled,
}: MappingsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const columns: ColumnDef<StubMapping>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all mappings"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="size-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label="Select mapping"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="size-4"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const mapping = row.original
        const kind = getMappingKind(mapping)
        return (
          <div className="flex flex-col gap-1">
            <Link
              to="/mappings/$mappingId"
              params={{ mappingId: mapping.id ?? '' }}
              className="font-medium hover:underline"
            >
              {mapping.name || '(unnamed)'}
            </Link>
            <div className="flex items-center gap-1.5">
              {kind.scenario && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <GitBranchIcon className="size-3" />
                  {mapping.scenarioName}
                </Badge>
              )}
              {kind.proxy && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <ArrowRightLeftIcon className="size-3" />
                  proxy
                </Badge>
              )}
              {kind.responseFile && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <FileTextIcon className="size-3" />
                  file
                </Badge>
              )}
              {getMappingTags(mapping).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )
      },
    },
    {
      id: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.original.request.method ?? 'ANY'
        return (
          <span
            className={cn(
              'inline-flex rounded px-1.5 py-0.5 text-xs font-mono font-semibold',
              methodColors[method] ?? 'bg-muted text-muted-foreground',
            )}
          >
            {method}
          </span>
        )
      },
    },
    {
      id: 'url',
      header: 'URL',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {getMappingUrl(row.original)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = getMappingStatusCode(row.original)
        if (!status) return <span className="text-muted-foreground">—</span>
        return (
          <Badge variant={status >= 500 ? 'destructive' : status >= 400 ? 'warning' : 'success'}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => row.original.priority ?? <span className="text-muted-foreground">—</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const mapping = row.original
        const disabled = isMappingDisabled(mapping)
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label={disabled ? 'Enable mapping' : 'Disable mapping'}
              onClick={() => onToggleDisabled(mapping)}
            >
              {disabled ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </Button>
            <Link to="/mappings/$mappingId" params={{ mappingId: mapping.id ?? '' }}>
              <Button size="icon" variant="ghost" aria-label="Edit mapping">
                <PencilIcon className="size-4" />
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Duplicate mapping"
              onClick={() => onDuplicate(mapping)}
            >
              <CopyIcon className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete mapping"
              onClick={() => onDelete(mapping)}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: mappings,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      onRowSelectionChange(next)
    },
    getRowId: (row, index) => row.id ?? row.uuid ?? String(index),
    getCoreRowModel: getCoreRowModel(),
  })

  const rows = table.getRowModel().rows

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
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
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === 'function'
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {typeof cell.column.columnDef.cell === 'function'
                      ? cell.column.columnDef.cell(cell.getContext())
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom }} />
            </tr>
          )}
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No mappings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
