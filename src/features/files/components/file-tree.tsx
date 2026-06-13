import { useState } from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { FileTreeNode } from '../utils/file-tree'

interface FileTreeProps {
  nodes: FileTreeNode[]
  selectedPath?: string
  onSelect: (path: string) => void
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  )
}

function FileTreeItem({
  node,
  selectedPath,
  onSelect,
  depth,
}: {
  node: FileTreeNode
  selectedPath?: string
  onSelect: (path: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)

  if (node.isDirectory) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? (
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
          )}
          {expanded ? (
            <FolderOpenIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(node.path)}
      className={cn(
        'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground',
        selectedPath === node.path && 'bg-accent text-accent-foreground',
      )}
      style={{ paddingLeft: `${depth * 16 + 8 + 18}px` }}
    >
      <FileIcon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}
