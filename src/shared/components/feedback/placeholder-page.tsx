import type { LucideIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card'

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
  phase,
}: {
  title: string
  description: string
  icon: LucideIcon
  phase: string
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <Icon className="mx-auto size-10 text-muted-foreground" />
          <CardTitle className="mt-2">Coming in {phase}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
