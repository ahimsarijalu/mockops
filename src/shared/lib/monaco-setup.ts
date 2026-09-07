// Import only the editor core + JSON language contribution, not the
// `monaco-editor` barrel (`import * as monaco from 'monaco-editor'`) —
// that pulls in every basic-language tokenizer (SQL, PHP, Ruby, Clojure,
// dozens more this app never uses) and multi-megabytes it doesn't need,
// since this app only ever renders `language="json"`.
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js'
import { loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// @monaco-editor/react defaults to fetching Monaco's AMD bundle from
// cdn.jsdelivr.net at runtime. Pointing its loader at the `monaco-editor`
// package instead (already bundled by Vite/Docker) makes the editor work
// fully offline — no CDN request, no network dependency in the built image.
self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  },
}

loader.config({ monaco })
