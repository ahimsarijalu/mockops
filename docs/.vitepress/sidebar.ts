import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  '/guide/': [
    {
      text: 'Getting Started',
      items: [
        { text: 'Overview', link: '/guide/overview' },
        { text: 'Installation', link: '/guide/installation' },
        { text: 'First Setup', link: '/guide/first-setup' },
        { text: 'Quick Start', link: '/guide/quick-start' },
      ],
    },
  ],

  '/features/': [
    {
      text: 'User Guide',
      items: [
        { text: 'Servers', link: '/features/servers' },
        { text: 'Dashboard', link: '/features/dashboard' },
        { text: 'Mappings', link: '/features/mappings' },
        { text: 'Request Journal & Near Misses', link: '/features/requests' },
        { text: 'Scenarios', link: '/features/scenarios' },
        { text: 'Recordings', link: '/features/recordings' },
        { text: 'Files', link: '/features/files' },
        { text: 'Response Templating', link: '/features/templates' },
        { text: 'Settings', link: '/features/settings' },
        { text: 'Audit Log', link: '/features/audit' },
      ],
    },
  ],

  '/architecture/': [
    {
      text: 'Architecture',
      items: [
        { text: 'System Overview', link: '/architecture/overview' },
        { text: 'Frontend Architecture', link: '/architecture/frontend' },
        { text: 'WireMock Integration', link: '/architecture/wiremock-integration' },
        { text: 'State Management', link: '/architecture/state-management' },
        { text: 'Routing', link: '/architecture/routing' },
        { text: 'Data Flow', link: '/architecture/data-flow' },
        { text: 'Security', link: '/architecture/security' },
      ],
    },
  ],

  '/development/': [
    {
      text: 'Developer Guide',
      items: [
        { text: 'Local Development', link: '/development/local-development' },
        { text: 'Project Structure', link: '/development/project-structure' },
        { text: 'Adding a Feature', link: '/development/feature-development' },
        { text: 'Adding an API Operation', link: '/development/api-integration' },
        { text: 'Testing', link: '/development/testing' },
        { text: 'Debugging', link: '/development/debugging' },
      ],
    },
  ],

  '/deployment/': [
    {
      text: 'Deployment',
      items: [
        { text: 'Docker', link: '/deployment/docker' },
        { text: 'Kubernetes', link: '/deployment/kubernetes' },
        { text: 'Helm', link: '/deployment/helm' },
        { text: 'GitHub Pages (this site)', link: '/deployment/github-pages' },
      ],
    },
  ],

  '/reference/': [
    {
      text: 'Reference',
      items: [
        { text: 'Configuration', link: '/reference/configuration' },
        { text: 'Environment Variables', link: '/reference/environment-variables' },
        { text: 'Commands', link: '/reference/commands' },
        { text: 'Architecture Decisions', link: '/reference/architecture-decisions' },
      ],
    },
    {
      text: 'AI / Coding Agents',
      items: [
        { text: 'Architecture Reference', link: '/ai/architecture' },
        { text: 'Conventions', link: '/ai/conventions' },
        { text: 'Feature Map', link: '/ai/feature-map' },
      ],
    },
  ],

  '/ai/': [
    {
      text: 'AI / Coding Agents',
      items: [
        { text: 'Architecture Reference', link: '/ai/architecture' },
        { text: 'Conventions', link: '/ai/conventions' },
        { text: 'Feature Map', link: '/ai/feature-map' },
      ],
    },
    {
      text: 'Reference',
      items: [
        { text: 'Configuration', link: '/reference/configuration' },
        { text: 'Environment Variables', link: '/reference/environment-variables' },
        { text: 'Commands', link: '/reference/commands' },
        { text: 'Architecture Decisions', link: '/reference/architecture-decisions' },
      ],
    },
  ],
}
