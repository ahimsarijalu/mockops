import { createFileRoute } from '@tanstack/react-router'
import { RequestJournalPage } from '@/features/requests/pages/request-journal-page'

export const Route = createFileRoute('/requests')({
  component: RequestJournalPage,
})
