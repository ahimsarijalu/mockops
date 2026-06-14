import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'

export function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  tone,
}: {
  title: string
  value: number | string
  icon: LucideIcon
  isLoading?: boolean
  tone?: 'default' | 'success' | 'warning' | 'destructive'
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon
          className={cn(
            'size-4',
            tone === 'success' && 'text-success',
            tone === 'warning' && 'text-warning',
            tone === 'destructive' && 'text-destructive',
            (!tone || tone === 'default') && 'text-muted-foreground',
          )}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}
