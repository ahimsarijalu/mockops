import { ServerIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { buttonVariants } from '@/shared/components/ui/button'

export function NoActiveServerState({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-16 text-center">
      <ServerIcon className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">No active server</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Link to="/servers" className={buttonVariants()}>
        Go to Servers
      </Link>
    </div>
  )
}
