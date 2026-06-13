import { createFileRoute } from '@tanstack/react-router'
import { FolderTreeIcon } from 'lucide-react'
import { PlaceholderPage } from '@/shared/components/feedback/placeholder-page'

export const Route = createFileRoute('/files')({
  component: () => (
    <PlaceholderPage
      title="File Explorer"
      description="Browse, upload, edit, and link __files used by bodyFileName responses."
      icon={FolderTreeIcon}
      phase="Phase 4"
    />
  ),
})
