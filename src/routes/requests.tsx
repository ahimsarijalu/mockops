import { createFileRoute } from '@tanstack/react-router'
import { HistoryIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/requests')({
  component: () => (
    <PlaceholderPage
      title="Request Journal"
      description="Live request/response inspection, search, filtering, and diffing."
      icon={HistoryIcon}
      phase="Phase 5"
    />
  ),
})
