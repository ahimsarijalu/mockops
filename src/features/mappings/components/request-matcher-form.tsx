import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { RequestPattern } from '@/shared/types/wiremock'
import { HTTP_METHODS, URL_MATCH_TYPES, type UrlMatchType } from '../schemas/matcher-options'
import { KeyValueMatcherEditor } from './key-value-matcher-editor'
import { BodyPatternEditor } from './body-pattern-editor'
import { getMappingUrlMatchType } from '../utils/mapping-helpers'

interface RequestMatcherFormProps {
  request: RequestPattern
  onChange: (request: RequestPattern) => void
}

export function RequestMatcherForm({ request, onChange }: RequestMatcherFormProps) {
  const urlMatchType = getMappingUrlMatchType({ request, response: {} })
  const urlValue =
    request.url ?? request.urlPath ?? request.urlPattern ?? request.urlPathPattern ?? ''

  const setUrlMatch = (type: UrlMatchType, val: string) => {
    const { url, urlPath, urlPattern, urlPathPattern, ...rest } = request
    void url
    void urlPath
    void urlPattern
    void urlPathPattern
    onChange({ ...rest, [type]: val })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[140px_140px_1fr] gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor="matcher-method">Method</Label>
          <Select
            value={request.method ?? 'ANY'}
            onValueChange={(method) => onChange({ ...request, method: method ?? undefined })}
          >
            <SelectTrigger id="matcher-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HTTP_METHODS.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="matcher-url-type">URL match type</Label>
          <Select
            value={urlMatchType}
            onValueChange={(type) => setUrlMatch(type as UrlMatchType, urlValue)}
          >
            <SelectTrigger id="matcher-url-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URL_MATCH_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="matcher-url">URL</Label>
          <Input
            id="matcher-url"
            value={urlValue}
            onChange={(e) => setUrlMatch(urlMatchType as UrlMatchType, e.target.value)}
            placeholder="/api/users/[0-9]+"
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Headers</Label>
        <KeyValueMatcherEditor
          value={request.headers ?? {}}
          onChange={(headers) => onChange({ ...request, headers })}
          keyPlaceholder="Header name"
          addLabel="Add header matcher"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Query parameters</Label>
        <KeyValueMatcherEditor
          value={request.queryParameters ?? {}}
          onChange={(queryParameters) => onChange({ ...request, queryParameters })}
          keyPlaceholder="Param name"
          addLabel="Add query parameter matcher"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Cookies</Label>
        <KeyValueMatcherEditor
          value={request.cookies ?? {}}
          onChange={(cookies) => onChange({ ...request, cookies })}
          keyPlaceholder="Cookie name"
          addLabel="Add cookie matcher"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>Body patterns</Label>
        <BodyPatternEditor
          value={request.bodyPatterns ?? []}
          onChange={(bodyPatterns) => onChange({ ...request, bodyPatterns })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="matcher-basic-auth-username">Basic auth username</Label>
          <Input
            id="matcher-basic-auth-username"
            value={request.basicAuthCredentials?.username ?? ''}
            onChange={(e) =>
              onChange({
                ...request,
                basicAuthCredentials: {
                  username: e.target.value,
                  password: request.basicAuthCredentials?.password ?? '',
                },
              })
            }
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="matcher-basic-auth-password">Basic auth password</Label>
          <Input
            id="matcher-basic-auth-password"
            type="password"
            value={request.basicAuthCredentials?.password ?? ''}
            onChange={(e) =>
              onChange({
                ...request,
                basicAuthCredentials: {
                  username: request.basicAuthCredentials?.username ?? '',
                  password: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
