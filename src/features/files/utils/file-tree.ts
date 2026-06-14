export interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children: FileTreeNode[]
}

export function buildFileTree(paths: string[]): FileTreeNode[] {
  const root: FileTreeNode[] = []

  for (const path of paths) {
    const segments = path.split('/').filter(Boolean)
    let level = root
    let currentPath = ''

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      const isDirectory = index < segments.length - 1
      let node = level.find((n) => n.name === segment && n.isDirectory === isDirectory)
      if (!node) {
        node = { name: segment, path: currentPath, isDirectory, children: [] }
        level.push(node)
      }
      level = node.children
    })
  }

  const sortTree = (nodes: FileTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach((node) => sortTree(node.children))
  }
  sortTree(root)

  return root
}

export function getFileLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json':
      return 'json'
    case 'xml':
      return 'xml'
    case 'html':
    case 'htm':
      return 'html'
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    case 'css':
      return 'css'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'md':
      return 'markdown'
    default:
      return 'plaintext'
  }
}
