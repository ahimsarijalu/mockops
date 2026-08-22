// Posts/updates the "Release Recommendation" sticky comment on a PR and
// maintains exactly one `release:major|minor|patch` label. Runs under
// pull_request_target with no PR code checked out — only GitHub API reads
// of PR metadata plus label/comment writes, so it's safe to run against
// untrusted fork PRs. See .github/workflows/pr-release-recommendation.yml.

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { classifyChange, isDocsOnly, bumpVersion } from './lib/classify.mjs'

const token = requireEnv('GITHUB_TOKEN')
const repo = requireEnv('GITHUB_REPOSITORY')
const prNumber = requireEnv('PR_NUMBER')
const prTitle = process.env.PR_TITLE || ''
const prBody = process.env.PR_BODY || ''
const prLabels = JSON.parse(process.env.PR_LABELS_JSON || '[]')

const MARKER = '<!-- mockops-release-recommendation -->'
const RELEASE_LABELS = ['major', 'minor', 'patch']
const LABEL_META = {
  major: { color: 'B60205', description: 'Next release from this PR will bump the MAJOR version' },
  minor: { color: 'FBCA04', description: 'Next release from this PR will bump the MINOR version' },
  patch: { color: '0E8A16', description: 'Next release from this PR will bump the PATCH version' },
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mockops-release-bot',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  if (!res.ok && res.status !== options.okOnStatus) {
    const text = await res.text()
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} failed: ${res.status} ${text}`)
  }
  return res
}

async function ghPaginated(path) {
  const items = []
  let page = 1
  for (;;) {
    const res = await gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
    const batch = await res.json()
    items.push(...batch)
    if (batch.length < 100) break
    page += 1
  }
  return items
}

function latestTag() {
  try {
    const out = execFileSync('git', ['tag', '-l', 'v*.*.*', '--sort=-v:refname'], {
      encoding: 'utf8',
    })
    const first = out.split('\n').find(Boolean)
    if (first) return first.trim()
  } catch {
    // fall through to null below
  }
  return null
}

async function main() {
  const files = (await ghPaginated(`/repos/${repo}/pulls/${prNumber}/files`)).map((f) => f.filename)
  const docsOnly = isDocsOnly(files)
  const classification = classifyChange({ title: prTitle, body: prBody, labels: prLabels })

  const previousTag = latestTag()
  // Mirrors mockops-release.mjs: with no prior tag, the actual first
  // release ships package.json's version unbumped, not one bumped past it
  // — so "current" and "expected" must be the same value here too, or the
  // comment would show a version merging never actually produces.
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
  const currentVersion = previousTag || `v${pkg.version}`
  const expectedVersion = previousTag
    ? bumpVersion(previousTag, classification.bump)
    : currentVersion

  await syncLabel(classification.bump)
  await syncComment({
    classification,
    docsOnly,
    currentVersion,
    expectedVersion,
    firstRelease: !previousTag,
  })

  console.log(
    `Recommendation: ${classification.bump} (${classification.reason}). ` +
      `${currentVersion} -> ${expectedVersion}. docsOnly=${docsOnly}`,
  )
}

async function syncLabel(bump) {
  const targetLabel = `release:${bump}`

  // Create the label if it doesn't exist yet (idempotent: 422 means it's
  // already there).
  await gh(`/repos/${repo}/labels`, {
    method: 'POST',
    okOnStatus: 422,
    body: JSON.stringify({ name: targetLabel, ...LABEL_META[bump] }),
  })

  const currentReleaseLabels = prLabels.filter((l) =>
    RELEASE_LABELS.some((level) => l === `release:${level}`),
  )

  await Promise.all(
    currentReleaseLabels
      .filter((l) => l !== targetLabel)
      .map((l) =>
        gh(`/repos/${repo}/issues/${prNumber}/labels/${encodeURIComponent(l)}`, {
          method: 'DELETE',
          okOnStatus: 404,
        }),
      ),
  )

  if (!currentReleaseLabels.includes(targetLabel)) {
    await gh(`/repos/${repo}/issues/${prNumber}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels: [targetLabel] }),
    })
  }
}

async function syncComment({
  classification,
  docsOnly,
  currentVersion,
  expectedVersion,
  firstRelease,
}) {
  const docsNote = docsOnly
    ? '\n> This PR only touches documentation. Even if merged, it will **not** trigger a MockOps application release — Docs Deploy runs instead.\n'
    : ''
  const firstReleaseNote = firstRelease
    ? "\n> No release has shipped yet, so current/expected version are both `package.json`'s version, unbumped — the first release establishes the baseline rather than applying this recommendation.\n"
    : ''

  const body = `${MARKER}
## Release Recommendation

**Recommended release:** \`${classification.bump}\`
**Current version:** \`${currentVersion}\`
**Expected version:** \`${expectedVersion}\`

**Reason:** ${classification.reason}
${docsNote}${firstReleaseNote}
<sub>Updates automatically as this PR changes. Informational only — the release level that actually ships is decided by \`mockops-release.yml\` from every PR merged into \`main\` since the last release (highest of: Conventional Commit type → \`release:*\` label, used only for a non-conventional title → patch fallback), and a release only happens at all if at least one merged PR touches non-documentation files.</sub>`

  const comments = await ghPaginated(`/repos/${repo}/issues/${prNumber}/comments`)
  const existing = comments.find((c) => c.body?.includes(MARKER))

  if (existing) {
    await gh(`/repos/${repo}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    })
  } else {
    await gh(`/repos/${repo}/issues/${prNumber}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
