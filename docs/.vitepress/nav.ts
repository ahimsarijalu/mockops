import type { DefaultTheme } from 'vitepress'

export const nav: DefaultTheme.NavItem[] = [
  { text: 'Guide', link: '/guide/overview', activeMatch: '^/guide/' },
  { text: 'User Guide', link: '/features/servers', activeMatch: '^/features/' },
  { text: 'Architecture', link: '/architecture/overview', activeMatch: '^/architecture/' },
  {
    text: 'Developer Guide',
    link: '/development/local-development',
    activeMatch: '^/development/',
  },
  { text: 'Deployment', link: '/deployment/docker', activeMatch: '^/deployment/' },
  {
    text: 'Reference',
    activeMatch: '^/(reference|ai)/',
    items: [
      { text: 'Configuration', link: '/reference/configuration' },
      { text: 'Environment variables', link: '/reference/environment-variables' },
      { text: 'Commands', link: '/reference/commands' },
      { text: 'Architecture decisions', link: '/reference/architecture-decisions' },
      { text: 'AI / coding-agent docs', link: '/ai/architecture' },
    ],
  },
]
