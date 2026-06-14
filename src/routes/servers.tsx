import { createFileRoute } from '@tanstack/react-router'
import { ServersPage } from '@/features/servers/pages/servers-page'

export const Route = createFileRoute('/servers')({
  component: ServersPage,
})
