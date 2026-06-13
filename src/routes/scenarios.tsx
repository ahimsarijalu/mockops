import { createFileRoute } from '@tanstack/react-router'
import { GitBranchIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/scenarios')({
  component: () => (
    <PlaceholderPage
      title="Scenarios"
      description="View and control scenario state machines, with visual state graphs."
      icon={GitBranchIcon}
      phase="Phase 6"
    />
  ),
})
