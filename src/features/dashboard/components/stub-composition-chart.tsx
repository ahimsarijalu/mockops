import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { DashboardMetrics } from '../api/use-dashboard-metrics'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#94a3b8']

export function StubCompositionChart({ metrics }: { metrics: DashboardMetrics }) {
  const data = useMemo(() => {
    const standard =
      metrics.totalStubs -
      metrics.scenarioStubs -
      metrics.proxyStubs -
      metrics.responseFileStubs -
      metrics.disabledStubs
    return [
      { name: 'Standard', value: Math.max(standard, 0) },
      { name: 'Scenario', value: metrics.scenarioStubs },
      { name: 'Proxy', value: metrics.proxyStubs },
      { name: 'Response file', value: metrics.responseFileStubs },
      { name: 'Disabled', value: metrics.disabledStubs },
    ].filter((d) => d.value > 0)
  }, [metrics])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stub composition</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No stubs yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
