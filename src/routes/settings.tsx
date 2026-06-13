import { createFileRoute } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/settings')({
  component: () => (
    <PlaceholderPage
      title="Settings"
      description="Global WireMock settings: delays, proxy pass-through, and console preferences."
      icon={SettingsIcon}
      phase="Phase 7"
    />
  ),
})
