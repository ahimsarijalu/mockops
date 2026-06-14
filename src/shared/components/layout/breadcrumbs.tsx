import { useRouterState } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'
import { navItems } from './nav-items'

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const segments = pathname.split('/').filter(Boolean)
  const current = navItems.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <span className="font-medium text-foreground">{current?.label ?? 'MockOps'}</span>
      {segments.slice(1).map((segment) => (
        <span key={segment} className="flex items-center gap-1.5 text-muted-foreground">
          <ChevronRightIcon className="size-3.5" />
          {decodeURIComponent(segment)}
        </span>
      ))}
    </nav>
  )
}
