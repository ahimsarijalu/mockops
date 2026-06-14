import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'
import { SearchIcon } from 'lucide-react'
import { useUiStore } from '@/shared/stores/ui-store'
import { navItems } from './nav-items'
import { cn } from '@/shared/lib/utils'

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen)
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, setOpen])

  const results = useMemo(
    () => navItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  const select = (to: string) => {
    navigate({ to })
    setOpen(false)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery('')
      setHighlighted(0)
    }
  }

  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
        <BaseDialog.Popup className="fixed left-1/2 top-32 z-50 w-full max-w-md -translate-x-1/2 rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <SearchIcon className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setHighlighted(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setHighlighted((h) => Math.min(h + 1, results.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setHighlighted((h) => Math.max(h - 1, 0))
                } else if (e.key === 'Enter' && results[highlighted]) {
                  select(results[highlighted].to)
                }
              }}
              placeholder="Search pages, mappings, scenarios..."
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2">
            {results.length === 0 && (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results found
              </li>
            )}
            {results.map((item, index) => (
              <li key={item.to}>
                <button
                  type="button"
                  onClick={() => select(item.to)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm',
                    index === highlighted
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
