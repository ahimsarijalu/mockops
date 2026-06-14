import { describe, it, expect } from 'vitest'
import { buildFileTree, getFileLanguage } from './file-tree'

describe('buildFileTree', () => {
  it('builds a nested tree from flat paths', () => {
    const tree = buildFileTree(['b.json', 'dir/a.txt', 'dir/sub/c.xml'])

    expect(tree.map((n) => n.name)).toEqual(['dir', 'b.json'])

    const dir = tree[0]
    expect(dir.isDirectory).toBe(true)
    expect(dir.children.map((n) => n.name)).toEqual(['sub', 'a.txt'])

    const sub = dir.children[0]
    expect(sub.isDirectory).toBe(true)
    expect(sub.children).toEqual([
      { name: 'c.xml', path: 'dir/sub/c.xml', isDirectory: false, children: [] },
    ])
  })

  it('sorts directories before files, alphabetically within each group', () => {
    const tree = buildFileTree(['z.txt', 'a.txt', 'zdir/x.txt', 'adir/y.txt'])
    expect(tree.map((n) => n.name)).toEqual(['adir', 'zdir', 'a.txt', 'z.txt'])
  })

  it('returns an empty tree for no paths', () => {
    expect(buildFileTree([])).toEqual([])
  })
})

describe('getFileLanguage', () => {
  it('maps known extensions to Monaco languages', () => {
    expect(getFileLanguage('responses/user.json')).toBe('json')
    expect(getFileLanguage('responses/user.xml')).toBe('xml')
    expect(getFileLanguage('page.html')).toBe('html')
    expect(getFileLanguage('script.js')).toBe('javascript')
    expect(getFileLanguage('module.ts')).toBe('typescript')
    expect(getFileLanguage('styles.css')).toBe('css')
    expect(getFileLanguage('config.yaml')).toBe('yaml')
    expect(getFileLanguage('config.yml')).toBe('yaml')
    expect(getFileLanguage('README.md')).toBe('markdown')
  })

  it('falls back to plaintext for unknown or missing extensions', () => {
    expect(getFileLanguage('noext')).toBe('plaintext')
    expect(getFileLanguage('data.bin')).toBe('plaintext')
  })
})
