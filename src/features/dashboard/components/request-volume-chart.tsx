import { useMemo } from 'react'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { ServeEvent } from '@/shared/types/wiremock'

export function RequestVolumeChart({ events }: { events: ServeEvent[] }) {
  const data = useMemo(() => {
    const buckets = new Map<string, { matched: number; unmatched: number }>()
    for (const event of events) {
      const date = event.request.loggedDate ? new Date(event.request.loggedDate) : new Date()
      const key = format(date, 'HH:mm')
      const bucket = buckets.get(key) ?? { matched: 0, unmatched: 0 }
      if (event.wasMatched === false) bucket.unmatched += 1
      else bucket.matched += 1
      buckets.set(key, bucket)
    }
    return Array.from(buckets.entries())
      .map(([time, value]) => ({ time, ...value }))
      .reverse()
  }, [events])

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Request volume</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No recent requests
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="matched"
                stackId="1"
                stroke="var(--color-success)"
                fill="var(--color-success)"
                fillOpacity={0.3}
                name="Matched"
              />
              <Area
                type="monotone"
                dataKey="unmatched"
                stackId="1"
                stroke="var(--color-destructive)"
                fill="var(--color-destructive)"
                fillOpacity={0.3}
                name="Unmatched"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
