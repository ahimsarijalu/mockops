import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import type { StubMapping } from '@/shared/types/wiremock'

interface MappingMetadataFormProps {
  mapping: StubMapping
  onChange: (mapping: StubMapping) => void
  metadataText: string
  onMetadataTextChange: (text: string) => void
  metadataError: string | null
}

export function MappingMetadataForm({
  mapping,
  onChange,
  metadataText,
  onMetadataTextChange,
  metadataError,
}: MappingMetadataFormProps) {
  const tags = Array.isArray((mapping.metadata as { tags?: unknown })?.tags)
    ? ((mapping.metadata as { tags?: unknown }).tags as unknown[]).filter(
        (t): t is string => typeof t === 'string',
      )
    : []

  const setTags = (value: string) => {
    const next = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const metadata = { ...mapping.metadata }
    if (next.length > 0) metadata.tags = next
    else delete metadata.tags
    onChange({ ...mapping, metadata: Object.keys(metadata).length > 0 ? metadata : undefined })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label>Tags (comma separated)</Label>
        <Input
          value={tags.join(', ')}
          onChange={(e) => setTags(e.target.value)}
          placeholder="team-checkout, deprecated"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Metadata (JSON)</Label>
        <MonacoJsonEditor value={metadataText} onChange={onMetadataTextChange} height={180} />
        {metadataError && <p className="text-xs text-destructive">{metadataError}</p>}
      </div>
    </div>
  )
}
