import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import type { NearMiss } from '@/shared/types/wiremock'

interface NearMissCardProps {
  nearMiss: NearMiss
}

export function NearMissCard({ nearMiss }: NearMissCardProps) {
  const { request, stubMapping, matchResult } = nearMiss

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">
            {request.method}
          </span>
          <span className="truncate text-muted-foreground">{request.url}</span>
        </div>
        {matchResult?.distance !== undefined && (
          <Badge variant="outline">distance {matchResult.distance.toFixed(3)}</Badge>
        )}
      </CardHeader>
      {stubMapping && (
        <CardContent className="pt-0 text-sm">
          <p className="text-muted-foreground">Closest matching stub:</p>
          <Link
            to="/mappings/$mappingId"
            params={{ mappingId: stubMapping.id ?? '' }}
            className="font-medium text-primary hover:underline"
          >
            {stubMapping.name || stubMapping.id}
          </Link>
        </CardContent>
      )}
    </Card>
  )
}
