#!/usr/bin/env node
// Regenerates docs/public/llms-full.txt by concatenating every documentation
// source page in reading order. Runs automatically as part of `npm run
// docs:build` (see package.json) so the file always reflects the current
// docs/ content — it is not maintained by hand and is gitignored.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const docsRoot = join(here, '..')

// Reading order mirrors the sidebar structure in docs/.vitepress/sidebar.ts.
const pages = [
  'index.md',
  'guide/overview.md',
  'guide/installation.md',
  'guide/first-setup.md',
  'guide/quick-start.md',
  'features/servers.md',
  'features/dashboard.md',
  'features/mappings.md',
  'features/requests.md',
  'features/scenarios.md',
  'features/recordings.md',
  'features/files.md',
  'features/templates.md',
  'features/settings.md',
  'features/audit.md',
  'architecture/overview.md',
  'architecture/frontend.md',
  'architecture/wiremock-integration.md',
  'architecture/state-management.md',
  'architecture/routing.md',
  'architecture/data-flow.md',
  'architecture/security.md',
  'development/local-development.md',
  'development/project-structure.md',
  'development/feature-development.md',
  'development/api-integration.md',
  'development/testing.md',
  'development/debugging.md',
  'deployment/docker.md',
  'deployment/kubernetes.md',
  'deployment/helm.md',
  'deployment/github-pages.md',
  'reference/configuration.md',
  'reference/environment-variables.md',
  'reference/commands.md',
  'reference/architecture-decisions.md',
  'ai/architecture.md',
  'ai/conventions.md',
  'ai/feature-map.md',
]

// The list above is curated for reading order and must be kept in sync by
// hand, but going out of sync should never be silent: fail loudly with an
// actionable message rather than quietly omitting a page from the output.
const NON_PAGE_DIRS = new Set(['.vitepress', 'public'])

async function findMarkdownFiles(dir) {
  const entries = await readdir(join(docsRoot, dir), { withFileTypes: true })
  const found = []
  for (const entry of entries) {
    const relPath = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      if (!NON_PAGE_DIRS.has(entry.name)) found.push(...(await findMarkdownFiles(relPath)))
    } else if (entry.name.endsWith('.md')) {
      found.push(relPath)
    }
  }
  return found
}

const actualPages = new Set(await findMarkdownFiles(''))
const listedPages = new Set(pages)
const missing = [...actualPages].filter((p) => !listedPages.has(p)).sort()
const stale = [...listedPages].filter((p) => !actualPages.has(p)).sort()
if (missing.length > 0 || stale.length > 0) {
  const problems = [
    missing.length > 0 && `not listed in the \`pages\` array: ${missing.join(', ')}`,
    stale.length > 0 && `listed but no longer exist: ${stale.join(', ')}`,
  ].filter(Boolean)
  throw new Error(
    `docs/.vitepress/generate-llms-full.mjs's page list is out of sync with docs/ — ${problems.join('; ')}.`,
  )
}

const sections = []
for (const relPath of pages) {
  const content = await readFile(join(docsRoot, relPath), 'utf8')
  // Strip vitepress frontmatter (--- ... ---) so the concatenated file is
  // plain markdown throughout.
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '').trim()
  sections.push(`<!-- source: docs/${relPath} -->\n\n${body}`)
}

const header = `# MockOps — Full Documentation

> Concatenation of every page on https://ahimsarijalu.github.io/mockops/ for
> tools that prefer a single plain-text document. Generated from docs/ at
> build time by docs/.vitepress/generate-llms-full.mjs — do not edit by hand.
> For the source repository, see https://github.com/ahimsarijalu/mockops.
`

await mkdir(join(docsRoot, 'public'), { recursive: true })
await writeFile(join(docsRoot, 'public/llms-full.txt'), `${header}\n${sections.join('\n\n---\n\n')}\n`)

console.log(`Wrote docs/public/llms-full.txt (${pages.length} pages)`)
