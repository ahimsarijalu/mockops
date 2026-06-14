import { createFileRoute } from '@tanstack/react-router'
import { RecordingsPage } from '@/features/recordings/pages/recordings-page'

export const Route = createFileRoute('/recordings')({
  component: RecordingsPage,
})
