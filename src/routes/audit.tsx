import { createFileRoute } from '@tanstack/react-router'
import { ScrollTextIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/audit')({
  component: () => (
    <PlaceholderPage
      title="Audit Log"
      description="Client-side history of stub, file, and import/export operations."
      icon={ScrollTextIcon}
      phase="Phase 7"
    />
  ),
})
