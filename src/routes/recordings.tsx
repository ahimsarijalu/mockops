import { createFileRoute } from '@tanstack/react-router'
import { RadioIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/recordings')({
  component: () => (
    <PlaceholderPage
      title="Recordings"
      description="Start/stop proxy recording sessions and review generated mappings."
      icon={RadioIcon}
      phase="Phase 6"
    />
  ),
})
