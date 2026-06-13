import { createFileRoute } from '@tanstack/react-router'
import { NearMissesPage } from '@/features/requests/pages/near-misses-page'

export const Route = createFileRoute('/near-misses')({
  component: NearMissesPage,
})
