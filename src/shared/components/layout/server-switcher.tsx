import { Link } from '@tanstack/react-router'
import { ChevronsUpDownIcon, PlusIcon, ServerIcon } from 'lucide-react'
import { useServerStore, useActiveServer } from '@/features/servers/store/server-store'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroupLabel,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export function ServerSwitcher() {
  const servers = useServerStore((s) => s.servers)
  const setActiveServer = useServerStore((s) => s.setActiveServer)
  const active = useActiveServer()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" className="min-w-48 justify-between">
            <span className="flex items-center gap-2 truncate">
              <ServerIcon className="size-4 shrink-0" />
              <span className="truncate">{active ? active.name : 'No server configured'}</span>
              {active && (
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    active.lastConnectionStatus === 'online'
                      ? 'bg-success'
                      : active.lastConnectionStatus === 'offline'
                        ? 'bg-destructive'
                        : 'bg-muted-foreground',
                  )}
                />
              )}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Servers
          </DropdownMenuGroupLabel>
          {servers.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No servers configured</div>
          )}
          {servers.map((server) => (
            <DropdownMenuItem key={server.id} onClick={() => setActiveServer(server.id)}>
              <span
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  server.lastConnectionStatus === 'online'
                    ? 'bg-success'
                    : server.lastConnectionStatus === 'offline'
                      ? 'bg-destructive'
                      : 'bg-muted-foreground',
                )}
              />
              <span className="flex-1 truncate">{server.name}</span>
              <Badge variant="outline" className="text-[10px]">
                {server.environment}
              </Badge>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/servers" />}>
          <PlusIcon className="size-4" />
          Manage servers
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
