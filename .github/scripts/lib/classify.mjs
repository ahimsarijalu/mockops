// Deterministic release classification shared by pr-recommendation.mjs and
// mockops-release.mjs. No AI/external service involved — priority is:
// breaking change > Conventional Commit type > release:* label > patch
// fallback. The label is checked *after* the Conventional Commit type, not
// before: the recommendation workflow re-applies whatever label it
// computes on every run, so if the label were checked first, the bot's own
// previous label would outrank a freshly-edited title and the
// recommendation could never change (and a label downgrade could never
// stick). Keeping title-parsing authoritative when the title is a
// recognized Conventional Commit avoids that; the label still matters as
// the deciding signal for a plain, non-conventional title.

const CONVENTIONAL_RE = /^(\w+)(\([^)]*\))?(!)?:\s*(.+)/
const BREAKING_FOOTER_RE = /BREAKING[ -]CHANGE:/i

const MINOR_TYPES = new Set(['feat'])
const PATCH_TYPES = new Set([
  'fix',
  'docs',
  'refactor',
  'test',
  'build',
  'ci',
  'chore',
  'perf',
  'style',
  'revert',
])

const RELEASE_LABELS = ['major', 'minor', 'patch']

/** Parse a Conventional Commits subject line, e.g. "feat(mappings)!: add X". */
export function parseConventional(subject) {
  const match = String(subject || '').match(CONVENTIONAL_RE)
  if (!match) return null
  return { type: match[1].toLowerCase(), breaking: match[3] === '!', description: match[4] }
}

/**
 * Classify a single change (PR or commit) from its subject/body/labels.
 * Returns { bump, reason, source } — bump is always 'major' | 'minor' | 'patch'.
 */
export function classifyChange({ title, body, labels = [] } = {}) {
  const conv = parseConventional(title)
  const breaking = (conv && conv.breaking) || BREAKING_FOOTER_RE.test(body || '')
  if (breaking) {
    return {
      bump: 'major',
      reason: conv?.breaking
        ? `breaking-change marker on a \`${conv.type}!:\` commit`
        : 'a `BREAKING CHANGE:` footer',
      source: 'conventional-commit',
    }
  }

  if (conv) {
    if (MINOR_TYPES.has(conv.type)) {
      return {
        bump: 'minor',
        reason: `conventional commit type \`${conv.type}:\``,
        source: 'conventional-commit',
      }
    }
    if (PATCH_TYPES.has(conv.type)) {
      return {
        bump: 'patch',
        reason: `conventional commit type \`${conv.type}:\``,
        source: 'conventional-commit',
      }
    }
  }

  // Only reached for a title with no recognized Conventional Commit type —
  // a release:* label is the deciding signal there instead (and, since
  // nothing above can override it, a human setting/changing the label on
  // such a PR sticks across subsequent runs).
  const label = RELEASE_LABELS.find((level) => labels.includes(`release:${level}`))
  if (label) {
    return { bump: label, reason: `explicit \`release:${label}\` label`, source: 'label' }
  }

  return {
    bump: 'patch',
    reason:
      'no recognized Conventional Commit type in the title and no `release:*` label; defaulting to patch',
    source: 'fallback',
  }
}

/** True when every changed file is documentation-only (docs/** or README.md). */
export function isDocsOnly(files) {
  if (!files || files.length === 0) return false
  return files.every((f) => f === 'README.md' || f.startsWith('docs/'))
}

const BUMP_RANK = { patch: 0, minor: 1, major: 2 }

/** Highest-priority bump among a list of bump levels (major > minor > patch). */
export function highestBump(levels) {
  return levels.reduce((acc, level) => (BUMP_RANK[level] > BUMP_RANK[acc] ? level : acc), 'patch')
}

/** Parse "vX.Y.Z" (or "X.Y.Z") into { major, minor, patch }. */
export function parseVersion(version) {
  const m = String(version || '').match(/^v?(\d+)\.(\d+)\.(\d+)$/)
  if (!m) throw new Error(`Not a valid semantic version: ${version}`)
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) }
}

/** Apply a bump level to a "vX.Y.Z" version, returning the next "vX.Y.Z". */
export function bumpVersion(current, level) {
  const { major, minor, patch } = parseVersion(current)
  if (level === 'major') return `v${major + 1}.0.0`
  if (level === 'minor') return `v${major}.${minor + 1}.0`
  return `v${major}.${minor}.${patch + 1}`
}
