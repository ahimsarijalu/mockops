import { createFileRoute } from '@tanstack/react-router'
import { MappingsListPage } from '@/features/mappings/pages/mappings-list-page'

export const Route = createFileRoute('/mappings')({
  component: MappingsListPage,
})
