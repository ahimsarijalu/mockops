import { createFileRoute } from '@tanstack/react-router'
import { MappingEditorPage } from '@/features/mappings/pages/mapping-editor-page'

export const Route = createFileRoute('/mappings/new')({
  component: MappingEditorPage,
})
