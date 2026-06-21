import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useBlocker } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/shared/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import { MonacoDiffEditor } from '@/shared/components/editor/monaco-diff-editor'
import { NoActiveServerState } from '@/shared/components/feedback/no-active-server-state'
import { useActiveServer } from '@/features/servers/store/server-store'
import { useMapping, useCreateMapping, useUpdateMapping } from '../api/use-mappings'
import { RequestMatcherForm } from '../components/request-matcher-form'
import { ResponseEditorForm } from '../components/response-editor-form'
import { MappingMetadataForm } from '../components/mapping-metadata-form'
import { emptyStubMapping } from '../utils/mapping-helpers'
import type { StubMapping } from '@/shared/types/wiremock'

function stripCatchall(metadata: StubMapping['metadata']): Record<string, unknown> {
  if (!metadata) return {}
  const { tags, ...rest } = metadata
  void tags
  return rest
}

export function MappingEditorPage() {
  const { mappingId } = useParams({ strict: false })
  const server = useActiveServer()
  const navigate = useNavigate()
  const isNew = !mappingId
  const { data: existingMapping, isLoading, error } = useMapping(server, mappingId)
  const createMapping = useCreateMapping(server)
  const updateMapping = useUpdateMapping(server)

  const [mapping, setMapping] = useState<StubMapping>(emptyStubMapping())
  const [initialMapping, setInitialMapping] = useState<StubMapping>(emptyStubMapping())
  const [loadedId, setLoadedId] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('visual')
  const [jsonText, setJsonText] = useState(() => JSON.stringify(emptyStubMapping(), null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [metadataText, setMetadataText] = useState('{}')
  const [metadataError, setMetadataError] = useState<string | null>(null)

  if (existingMapping && existingMapping.id !== loadedId) {
    setMapping(existingMapping)
    setInitialMapping(existingMapping)
    setLoadedId(existingMapping.id)
    setJsonText(JSON.stringify(existingMapping, null, 2))
    setMetadataText(JSON.stringify(stripCatchall(existingMapping.metadata), null, 2))
  }

  const isDirty = JSON.stringify(mapping) !== JSON.stringify(initialMapping)

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  })

  const updateMappingState = (next: StubMapping) => {
    setMapping(next)
    setJsonText(JSON.stringify(next, null, 2))
  }

  const applyJsonText = (text: string) => {
    setJsonText(text)
    try {
      const parsed = JSON.parse(text) as StubMapping
      setJsonError(null)
      setMapping(parsed)
    } catch {
      setJsonError('Invalid JSON')
    }
  }

  const applyMetadataText = (text: string) => {
    setMetadataText(text)
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>
      setMetadataError(null)
      const tags = (mapping.metadata as { tags?: unknown })?.tags
      const nextMetadata = { ...parsed, ...(tags !== undefined ? { tags } : {}) }
      updateMappingState({
        ...mapping,
        metadata: Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined,
      })
    } catch {
      setMetadataError('Invalid JSON')
    }
  }

  if (!server) {
    return (
      <NoActiveServerState description="Add and select a WireMock server to manage mappings." />
    )
  }

  if (!isNew && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!isNew && error) {
    return (
      <div className="space-y-4">
        <Link to="/mappings" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="rounded-md border border-destructive/50 p-4 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load mapping'}
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (isNew) {
      createMapping.mutate(mapping, {
        onSuccess: (created) => {
          setInitialMapping(created)
          navigate({ to: '/mappings' })
        },
      })
    } else if (mapping.id) {
      updateMapping.mutate(
        { id: mapping.id, mapping },
        {
          onSuccess: (updated) => {
            setMapping(updated)
            setInitialMapping(updated)
            setJsonText(JSON.stringify(updated, null, 2))
          },
        },
      )
    }
  }

  const isSaving = createMapping.isPending || updateMapping.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/mappings" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
            <ArrowLeftIcon className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{isNew ? 'New mapping' : 'Edit mapping'}</h1>
            <p className="text-sm text-muted-foreground">
              {mapping.name || mapping.id || 'Unnamed mapping'} on {server.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/mappings" className={buttonVariants({ variant: 'outline' })}>
            Cancel
          </Link>
          <Button onClick={handleSave} disabled={isSaving || (activeTab === 'json' && !!jsonError)}>
            {isSaving ? 'Saving...' : 'Save mapping'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md border border-border p-4 sm:grid-cols-4">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Name</Label>
          <Input
            value={mapping.name ?? ''}
            onChange={(e) => updateMappingState({ ...mapping, name: e.target.value || undefined })}
            placeholder="Get user by id"
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Priority</Label>
          <Input
            type="number"
            value={mapping.priority ?? ''}
            onChange={(e) =>
              updateMappingState({
                ...mapping,
                priority: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="flex items-center gap-2 self-end pb-1">
          <Switch
            checked={mapping.persistent ?? true}
            onCheckedChange={(checked) => updateMappingState({ ...mapping, persistent: checked })}
          />
          <Label className="cursor-pointer">Persistent</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-md border border-border p-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label>Scenario name</Label>
          <Input
            value={mapping.scenarioName ?? ''}
            onChange={(e) =>
              updateMappingState({ ...mapping, scenarioName: e.target.value || undefined })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Required scenario state</Label>
          <Input
            value={mapping.requiredScenarioState ?? ''}
            onChange={(e) =>
              updateMappingState({
                ...mapping,
                requiredScenarioState: e.target.value || undefined,
              })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label>New scenario state</Label>
          <Input
            value={mapping.newScenarioState ?? ''}
            onChange={(e) =>
              updateMappingState({ ...mapping, newScenarioState: e.target.value || undefined })
            }
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)}>
        <TabsList>
          <TabsTab value="visual">Visual builder</TabsTab>
          <TabsTab value="json">JSON editor</TabsTab>
          {!isNew && <TabsTab value="diff">Diff</TabsTab>}
        </TabsList>

        <TabsPanel value="visual" className="mt-4 space-y-6">
          <div className="rounded-md border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Request matcher</h2>
            <RequestMatcherForm
              request={mapping.request}
              onChange={(request) => updateMappingState({ ...mapping, request })}
            />
          </div>
          <div className="rounded-md border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Response</h2>
            <ResponseEditorForm
              response={mapping.response}
              onChange={(response) => updateMappingState({ ...mapping, response })}
            />
          </div>
          <div className="rounded-md border border-border p-4">
            <h2 className="mb-3 text-sm font-semibold">Metadata</h2>
            <MappingMetadataForm
              mapping={mapping}
              onChange={updateMappingState}
              metadataText={metadataText}
              onMetadataTextChange={applyMetadataText}
              metadataError={metadataError}
            />
          </div>
        </TabsPanel>

        <TabsPanel value="json" className="mt-4 space-y-2">
          <MonacoJsonEditor value={jsonText} onChange={applyJsonText} height={500} />
          {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
        </TabsPanel>

        {!isNew && (
          <TabsPanel value="diff" className="mt-4">
            <MonacoDiffEditor
              original={JSON.stringify(initialMapping, null, 2)}
              modified={JSON.stringify(mapping, null, 2)}
              height={500}
            />
          </TabsPanel>
        )}
      </Tabs>

      <Dialog
        open={blocker.status === 'blocked'}
        onOpenChange={(open) => {
          if (!open) blocker.reset?.()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes to this mapping. Leaving now will discard them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" onClick={() => blocker.reset?.()} />}>
              Keep editing
            </DialogClose>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
