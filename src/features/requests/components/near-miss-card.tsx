import { Link } from '@tanstack/react-router'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { explainMismatch } from '../utils/near-miss-diagnostics'
import type { NearMiss } from '@/shared/types/wiremock'

interface NearMissCardProps {
  nearMiss: NearMiss
}

export function NearMissCard({ nearMiss }: NearMissCardProps) {
  const { request, stubMapping, matchResult } = nearMiss
  const mismatches = stubMapping ? explainMismatch(request, stubMapping.request) : []

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
        <CardContent className="space-y-3 pt-0 text-sm">
          <div>
            <p className="text-muted-foreground">Closest matching stub:</p>
            <Link
              to="/mappings/$mappingId"
              params={{ mappingId: stubMapping.id ?? '' }}
              className="font-medium text-primary hover:underline"
            >
              {stubMapping.name || stubMapping.id}
            </Link>
          </div>
          {mismatches.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Why it didn't match:</p>
              <ul className="space-y-1">
                {mismatches.map((mismatch, i) => (
                  <li
                    key={i}
                    className="rounded border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-xs"
                  >
                    <span className="font-semibold text-destructive">{mismatch.label}</span>
                    <div className="mt-0.5 grid grid-cols-[auto_1fr] gap-x-2 font-mono text-muted-foreground">
                      <span>expected</span>
                      <span className="truncate">{mismatch.expected}</span>
                      <span>actual</span>
                      <span className="truncate">{mismatch.actual}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No field-level mismatch could be detected client-side (the difference may be in a
              JSON/XPath body matcher WireMock evaluates server-side).
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
