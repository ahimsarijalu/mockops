import { createFileRoute } from '@tanstack/react-router'
import { TargetIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/near-misses')({
  component: () => (
    <PlaceholderPage
      title="Near Miss Analysis"
      description="Diagnose unmatched requests with closest-match scoring and mismatch explanations."
      icon={TargetIcon}
      phase="Phase 5"
    />
  ),
})
