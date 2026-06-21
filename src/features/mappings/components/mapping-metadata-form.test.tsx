import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MappingMetadataForm } from './mapping-metadata-form'
import { emptyStubMapping } from '../utils/mapping-helpers'

vi.mock('@/shared/components/editor/monaco-json-editor', () => ({
  MonacoJsonEditor: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea aria-label="metadata-json" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}))

describe('MappingMetadataForm', () => {
  it('renders existing tags joined by comma', () => {
    const mapping = { ...emptyStubMapping(), metadata: { tags: ['a', 'b'] } }
    render(
      <MappingMetadataForm
        mapping={mapping}
        onChange={() => {}}
        metadataText="{}"
        onMetadataTextChange={() => {}}
        metadataError={null}
      />,
    )
    expect(screen.getByLabelText(/tags/i)).toHaveValue('a, b')
  })

  it('parses comma-separated input into a trimmed tags array', async () => {
    const onChange = vi.fn()
    const mapping = emptyStubMapping()
    render(
      <MappingMetadataForm
        mapping={mapping}
        onChange={onChange}
        metadataText="{}"
        onMetadataTextChange={() => {}}
        metadataError={null}
      />,
    )
    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'team-checkout, deprecated' },
    })
    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall.metadata).toEqual({ tags: ['team-checkout', 'deprecated'] })
  })

  it('removes the tags key entirely when cleared', async () => {
    const onChange = vi.fn()
    const mapping = { ...emptyStubMapping(), metadata: { tags: ['a'] } }
    render(
      <MappingMetadataForm
        mapping={mapping}
        onChange={onChange}
        metadataText="{}"
        onMetadataTextChange={() => {}}
        metadataError={null}
      />,
    )
    await userEvent.clear(screen.getByLabelText(/tags/i))
    const lastCall = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall.metadata).toBeUndefined()
  })

  it('shows the metadata error message when present', () => {
    render(
      <MappingMetadataForm
        mapping={emptyStubMapping()}
        onChange={() => {}}
        metadataText="not json"
        onMetadataTextChange={() => {}}
        metadataError="Invalid JSON"
      />,
    )
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument()
  })
})
