// Determines whether a push to `main` should produce a MockOps release,
// and if so, what the next version is. Writes its result to
// $GITHUB_OUTPUT for .github/workflows/mockops-release.yml.
//
// Deterministic, no AI service required:
//   1. No prior `v*.*.*` tag -> this is the first release; use the
//      version already in package.json (never invented from commit
//      counts/timestamps).
//   2. Otherwise, if every file changed since the last tag is
//      documentation-only (docs/** or README.md) -> no release.
//   3. Otherwise, classify every commit since the last tag (via its PR,
//      when the commit is a merge/squash of one, else the commit subject
//      itself) and bump by the highest of: `release:*` label > Conventional
//      Commit type > patch fallback.

import { execFileSync } from 'node:child_process'
import { readFileSync, appendFileSync } from 'node:fs'
import { classifyChange, isDocsOnly, highestBump, bumpVersion } from './lib/classify.mjs'

const token = requireEnv('GITHUB_TOKEN')
const repo = requireEnv('GITHUB_REPOSITORY')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'mockops-release-bot',
    },
  })
  if (!res.ok) throw new Error(`GitHub API GET ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

function latestTag() {
  const out = git(['tag', '-l', 'v*.*.*', '--sort=-v:refname'])
  const first = out.split('\n').find(Boolean)
  return first ? first.trim() : null
}

function tagExists(tag) {
  try {
    execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function extractPrNumber(subject) {
  const merge = subject.match(/^Merge pull request #(\d+)/)
  if (merge) return Number(merge[1])
  const squash = subject.match(/\(#(\d+)\)\s*$/)
  if (squash) return Number(squash[1])
  return null
}

async function determine() {
  const previousTag = latestTag()

  if (!previousTag) {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    return {
      releaseRequired: true,
      previousVersion: null,
      version: `v${pkg.version}`,
      bump: 'initial',
      reason: `first release — no prior tag found, using package.json version (${pkg.version})`,
      prNumbers: [],
    }
  }

  const changedFiles = git(['diff', '--name-only', `${previousTag}..HEAD`])
    .split('\n')
    .filter(Boolean)

  if (isDocsOnly(changedFiles)) {
    return {
      releaseRequired: false,
      previousVersion: previousTag,
      version: null,
      bump: null,
      reason: `every file changed since ${previousTag} is documentation-only`,
      prNumbers: [],
    }
  }

  const subjects = git(['log', `${previousTag}..HEAD`, '--first-parent', '--pretty=%s'])
    .split('\n')
    .filter(Boolean)

  const prNumbers = [...new Set(subjects.map(extractPrNumber).filter((n) => n !== null))]

  const prClassifications = await Promise.all(
    prNumbers.map(async (number) => {
      const pr = await gh(`/repos/${repo}/pulls/${number}`)
      const labels = (pr.labels || []).map((l) => l.name)
      const classification = classifyChange({ title: pr.title, body: pr.body, labels })
      return { number, ...classification }
    }),
  )

  const commitOnlyClassifications = subjects
    .filter((subject) => extractPrNumber(subject) === null)
    .map((subject) => classifyChange({ title: subject, body: '', labels: [] }))

  const allClassifications = [...prClassifications, ...commitOnlyClassifications]
  const bump = highestBump(allClassifications.map((c) => c.bump))
  const version = bumpVersion(previousTag, bump)

  return {
    releaseRequired: true,
    previousVersion: previousTag,
    version,
    bump,
    reason: `highest bump among ${allClassifications.length} change(s) since ${previousTag}`,
    prNumbers,
  }
}

async function main() {
  const result = await determine()

  if (result.releaseRequired && result.version && tagExists(result.version)) {
    throw new Error(
      `Computed next version ${result.version} but that tag already exists — refusing to release. ` +
        'This usually means a previous release run already shipped it; investigate before re-running.',
    )
  }

  const output = process.env.GITHUB_OUTPUT
  const lines = [
    `release_required=${result.releaseRequired}`,
    `previous_version=${result.previousVersion || ''}`,
    `version=${result.version || ''}`,
    `bump=${result.bump || ''}`,
    `reason=${result.reason}`,
    `pr_numbers=${result.prNumbers.join(',')}`,
  ]
  if (output) appendFileSync(output, lines.join('\n') + '\n')
  console.log(lines.join('\n'))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
