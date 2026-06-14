import { Link } from '@tanstack/react-router'
import { BoxesIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { navItems } from './nav-items'

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        'flex h-full w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <BoxesIcon className="size-5 text-primary" />
        <span className="text-base font-semibold">MockOps</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            activeProps={{ className: 'active' }}
            activeOptions={{ exact: item.to === '/' }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
