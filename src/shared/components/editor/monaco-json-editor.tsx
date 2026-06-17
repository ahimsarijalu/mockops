import Editor, { type OnMount } from '@monaco-editor/react'
import { useUiStore } from '@/shared/stores/ui-store'
import '@/shared/lib/monaco-setup'

interface MonacoJsonEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string | number
  readOnly?: boolean
}

export function MonacoJsonEditor({
  value,
  onChange,
  language = 'json',
  height = 240,
  readOnly = false,
}: MonacoJsonEditorProps) {
  const theme = useUiStore((s) => s.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleMount: OnMount = (editor) => {
    editor.updateOptions({ tabSize: 2 })
  }

  return (
    <div className="overflow-hidden rounded-md border border-input">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val ?? '')}
        theme={isDark ? 'vs-dark' : 'light'}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          scrollBeyondLastLine: false,
          readOnly,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  )
}
