import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { StringValuePattern } from '@/shared/types/wiremock'
import { BODY_MATCHER_TYPES, type BodyMatcherType } from '../schemas/matcher-options'

function detectBodyMatcherType(pattern: StringValuePattern): BodyMatcherType {
  for (const { value } of BODY_MATCHER_TYPES) {
    if (value in pattern) return value
  }
  return 'equalTo'
}

function getValue(pattern: StringValuePattern, type: BodyMatcherType): string {
  const value = (pattern as Record<string, unknown>)[type]
  if (typeof value === 'string') return value
  if (value !== undefined) return JSON.stringify(value, null, 2)
  return ''
}

interface BodyPatternEditorProps {
  value: StringValuePattern[]
  onChange: (value: StringValuePattern[]) => void
}

export function BodyPatternEditor({ value, onChange }: BodyPatternEditorProps) {
  const update = (index: number, pattern: StringValuePattern) => {
    const next = [...value]
    next[index] = pattern
    onChange(next)
  }

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))

  const add = () => onChange([...value, { equalToJson: '' }])

  return (
    <div className="space-y-3">
      {value.map((pattern, index) => {
        const matcherType = detectBodyMatcherType(pattern)
        return (
          <div key={index} className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <Select
                value={matcherType}
                onValueChange={(type) => {
                  const newType = type as BodyMatcherType
                  update(index, { [newType]: getValue(pattern, matcherType) })
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_MATCHER_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove pattern"
                onClick={() => remove(index)}
              >
                <Trash2Icon className="size-4 text-destructive" />
              </Button>
            </div>
            <Textarea
              value={getValue(pattern, matcherType)}
              onChange={(e) => update(index, { [matcherType]: e.target.value })}
              placeholder="Pattern value"
              className="font-mono text-xs"
              rows={3}
            />
            {(matcherType === 'equalToJson' || matcherType === 'equalToXml') && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={!!pattern.ignoreArrayOrder}
                  onChange={(e) =>
                    update(index, { ...pattern, ignoreArrayOrder: e.target.checked })
                  }
                />
                Ignore array order
              </label>
            )}
          </div>
        )
      })}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <PlusIcon className="size-3.5" />
        Add body pattern
      </Button>
    </div>
  )
}
