import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { MappingEditorPage } from '@/features/mappings/pages/mapping-editor-page'

const paramsSchema = z.object({ mappingId: z.string().min(1) })

export const Route = createFileRoute('/mappings_/$mappingId')({
  params: {
    parse: (raw) => paramsSchema.parse(raw),
  },
  component: MappingEditorPage,
})
