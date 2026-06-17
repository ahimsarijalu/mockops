import { DiffEditor, type DiffOnMount } from '@monaco-editor/react'
import { useUiStore } from '@/shared/stores/ui-store'
import '@/shared/lib/monaco-setup'

interface MonacoDiffEditorProps {
  original: string
  modified: string
  language?: string
  height?: string | number
}

export function MonacoDiffEditor({
  original,
  modified,
  language = 'json',
  height = 400,
}: MonacoDiffEditorProps) {
  const theme = useUiStore((s) => s.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleMount: DiffOnMount = (editor) => {
    editor.getModifiedEditor().updateOptions({ tabSize: 2 })
    editor.getOriginalEditor().updateOptions({ tabSize: 2 })
  }

  return (
    <div className="overflow-hidden rounded-md border border-input">
      <DiffEditor
        height={height}
        language={language}
        original={original}
        modified={modified}
        theme={isDark ? 'vs-dark' : 'light'}
        onMount={handleMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          renderSideBySide: true,
        }}
      />
    </div>
  )
}
