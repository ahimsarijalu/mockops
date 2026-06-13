import { useState } from 'react'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { MonacoJsonEditor } from '@/shared/components/editor/monaco-json-editor'
import type { ResponseDefinition } from '@/shared/types/wiremock'
import { FAULT_TYPES, RESPONSE_BODY_MODES, type ResponseBodyMode } from '../schemas/matcher-options'
import { KeyValueMatcherEditor } from './key-value-matcher-editor'

interface ResponseEditorFormProps {
  response: ResponseDefinition
  onChange: (response: ResponseDefinition) => void
}

function detectBodyMode(response: ResponseDefinition): ResponseBodyMode {
  if (response.bodyFileName) return 'file'
  if (response.jsonBody !== undefined) return 'json'
  if (response.body !== undefined) return 'text'
  return 'none'
}

export function ResponseEditorForm({ response, onChange }: ResponseEditorFormProps) {
  const [bodyMode, setBodyMode] = useState<ResponseBodyMode>(detectBodyMode(response))
  const [jsonBodyText, setJsonBodyText] = useState(() =>
    response.jsonBody !== undefined ? JSON.stringify(response.jsonBody, null, 2) : '{\n  \n}',
  )
  const [jsonError, setJsonError] = useState<string | null>(null)

  const switchBodyMode = (mode: ResponseBodyMode) => {
    setBodyMode(mode)
    const { jsonBody, body, bodyFileName, base64Body, ...rest } = response
    void jsonBody
    void body
    void bodyFileName
    void base64Body
    if (mode === 'json') {
      try {
        onChange({ ...rest, jsonBody: JSON.parse(jsonBodyText) })
      } catch {
        onChange({ ...rest, jsonBody: {} })
      }
    } else if (mode === 'text') {
      onChange({ ...rest, body: '' })
    } else if (mode === 'file') {
      onChange({ ...rest, bodyFileName: '' })
    } else {
      onChange(rest)
    }
  }

  // headers as plain string-or-array map for matcher editor reuse (treat as equalTo entries)
  const headerEntries = Object.fromEntries(
    Object.entries(response.headers ?? {}).map(([k, v]) => [
      k,
      { equalTo: Array.isArray(v) ? v.join(', ') : v },
    ]),
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-1.5">
          <Label>Status code</Label>
          <Input
            type="number"
            value={response.status ?? 200}
            onChange={(e) => onChange({ ...response, status: Number(e.target.value) })}
          />
        </div>
        <div className="grid gap-1.5 col-span-2">
          <Label>Status message</Label>
          <Input
            value={response.statusMessage ?? ''}
            onChange={(e) => onChange({ ...response, statusMessage: e.target.value || undefined })}
            placeholder="OK"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Response body</Label>
        <Select value={bodyMode} onValueChange={(mode) => switchBodyMode(mode as ResponseBodyMode)}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESPONSE_BODY_MODES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {bodyMode === 'json' && (
          <>
            <MonacoJsonEditor
              value={jsonBodyText}
              onChange={(value) => {
                setJsonBodyText(value)
                try {
                  const parsed = JSON.parse(value)
                  setJsonError(null)
                  onChange({ ...response, jsonBody: parsed })
                } catch {
                  setJsonError('Invalid JSON')
                }
              }}
            />
            {jsonError && <p className="text-xs text-destructive">{jsonError}</p>}
          </>
        )}

        {bodyMode === 'text' && (
          <MonacoJsonEditor
            value={response.body ?? ''}
            onChange={(value) => onChange({ ...response, body: value })}
            language="html"
          />
        )}

        {bodyMode === 'file' && (
          <Input
            value={response.bodyFileName ?? ''}
            onChange={(e) => onChange({ ...response, bodyFileName: e.target.value })}
            placeholder="responses/user.json"
            className="font-mono"
          />
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>Response headers</Label>
        <KeyValueMatcherEditor
          value={headerEntries}
          onChange={(headers) => {
            const next: Record<string, string> = {}
            for (const [key, pattern] of Object.entries(headers)) {
              if (typeof pattern.equalTo === 'string') next[key] = pattern.equalTo
            }
            onChange({ ...response, headers: next })
          }}
          keyPlaceholder="Header name"
          addLabel="Add response header"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-1.5">
          <Label>Fixed delay (ms)</Label>
          <Input
            type="number"
            value={response.fixedDelayMilliseconds ?? ''}
            onChange={(e) =>
              onChange({
                ...response,
                fixedDelayMilliseconds: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Fault</Label>
          <Select
            value={response.fault ?? 'none'}
            onValueChange={(value) =>
              onChange({
                ...response,
                fault: value === 'none' ? undefined : (value as ResponseDefinition['fault']),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {FAULT_TYPES.map((fault) => (
                <SelectItem key={fault.value} value={fault.value}>
                  {fault.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Proxy base URL</Label>
          <Input
            value={response.proxyBaseUrl ?? ''}
            onChange={(e) => onChange({ ...response, proxyBaseUrl: e.target.value || undefined })}
            placeholder="https://api.example.com"
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label>Chunked dribble delay — number of chunks</Label>
          <Input
            type="number"
            value={response.chunkedDribbleDelay?.numberOfChunks ?? ''}
            onChange={(e) => {
              const numberOfChunks = Number(e.target.value)
              onChange({
                ...response,
                chunkedDribbleDelay: e.target.value
                  ? {
                      numberOfChunks,
                      totalDuration: response.chunkedDribbleDelay?.totalDuration ?? 1000,
                    }
                  : undefined,
              })
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Chunked dribble delay — total duration (ms)</Label>
          <Input
            type="number"
            value={response.chunkedDribbleDelay?.totalDuration ?? ''}
            onChange={(e) => {
              const totalDuration = Number(e.target.value)
              onChange({
                ...response,
                chunkedDribbleDelay: e.target.value
                  ? {
                      numberOfChunks: response.chunkedDribbleDelay?.numberOfChunks ?? 1,
                      totalDuration,
                    }
                  : undefined,
              })
            }}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!response.transformers?.includes('response-template')}
          onChange={(e) => {
            const transformers = new Set(response.transformers ?? [])
            if (e.target.checked) transformers.add('response-template')
            else transformers.delete('response-template')
            onChange({
              ...response,
              transformers: transformers.size > 0 ? Array.from(transformers) : undefined,
            })
          }}
        />
        Enable response templating (response-template transformer)
      </label>
    </div>
  )
}
