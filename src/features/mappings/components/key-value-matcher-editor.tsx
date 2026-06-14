import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import type { StringValuePattern } from '@/shared/types/wiremock'
import { STRING_MATCHER_TYPES, type StringMatcherType } from '../schemas/matcher-options'

export type KeyValueMatcherMap = Record<string, StringValuePattern>

function detectMatcherType(pattern: StringValuePattern): StringMatcherType {
  for (const { value } of STRING_MATCHER_TYPES) {
    if (value in pattern) return value
  }
  return 'equalTo'
}

function getMatcherValue(pattern: StringValuePattern, type: StringMatcherType): string {
  if (type === 'absent') return ''
  const value = (pattern as Record<string, unknown>)[type]
  return typeof value === 'string' ? value : ''
}

interface KeyValueMatcherEditorProps {
  value: KeyValueMatcherMap
  onChange: (value: KeyValueMatcherMap) => void
  keyPlaceholder?: string
  addLabel?: string
}

export function KeyValueMatcherEditor({
  value,
  onChange,
  keyPlaceholder = 'Name',
  addLabel = 'Add',
}: KeyValueMatcherEditorProps) {
  const entries = Object.entries(value)

  const updateEntry = (index: number, key: string, pattern: StringValuePattern) => {
    const next = [...entries]
    next[index] = [key, pattern]
    onChange(Object.fromEntries(next))
  }

  const removeEntry = (index: number) => {
    const next = entries.filter((_, i) => i !== index)
    onChange(Object.fromEntries(next))
  }

  const addEntry = () => {
    onChange({ ...value, ['']: { equalTo: '' } })
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, pattern], index) => {
        const matcherType = detectMatcherType(pattern)
        return (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={key}
              onChange={(e) => updateEntry(index, e.target.value, pattern)}
              placeholder={keyPlaceholder}
              className="w-40"
            />
            <Select
              value={matcherType}
              onValueChange={(type) => {
                const newType = type as StringMatcherType
                const newPattern: StringValuePattern =
                  newType === 'absent'
                    ? { absent: true }
                    : { [newType]: getMatcherValue(pattern, matcherType) }
                updateEntry(index, key, newPattern)
              }}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STRING_MATCHER_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {matcherType !== 'absent' && (
              <Input
                value={getMatcherValue(pattern, matcherType)}
                onChange={(e) => updateEntry(index, key, { [matcherType]: e.target.value })}
                placeholder="Value"
                className="flex-1"
              />
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Remove"
              onClick={() => removeEntry(index)}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        )
      })}
      <Button type="button" size="sm" variant="outline" onClick={addEntry}>
        <PlusIcon className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  )
}
