import { SearchIcon } from 'lucide-react'
import { useUiStore } from '@/shared/stores/ui-store'
import { Button } from '@/shared/components/ui/button'
import { ServerSwitcher } from './server-switcher'
import { ThemeToggle } from './theme-toggle'
import { Breadcrumbs } from './breadcrumbs'

export function Header() {
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen)

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
      <Breadcrumbs />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <SearchIcon className="size-4" />
          Search
          <kbd className="ml-2 rounded border border-border bg-muted px-1.5 text-[10px]">
            Ctrl K
          </kbd>
        </Button>
        <ServerSwitcher />
        <ThemeToggle />
      </div>
    </header>
  )
}
