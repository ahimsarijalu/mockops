import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { nav } from './nav'
import { sidebar } from './sidebar'

// Documentation site for MockOps (https://github.com/ahimsarijalu/mockops).
// Deployed to GitHub Pages as a project site, so `base` must match the repo
// name — see docs/deployment/github-pages.md and .github/workflows/docs.yml.
export default withMermaid(
  defineConfig({
    title: 'MockOps',
    description:
      'Documentation for MockOps, a WireMock API management console for browsing, editing, and operating one or more WireMock servers through their Admin API.',
    lang: 'en-US',

    base: '/mockops/',
    // Every markdown file builds to its own <name>.html and links keep the
    // extension, so direct navigation/refresh works on plain static hosting
    // (including GitHub Pages) without relying on extension-less rewrites.
    cleanUrls: false,
    lastUpdated: true,
    ignoreDeadLinks: false,

    head: [['link', { rel: 'icon', href: '/mockops/favicon.svg', type: 'image/svg+xml' }]],

    themeConfig: {
      logo: '/favicon.svg',
      nav,
      sidebar,
      outline: { level: [2, 3] },

      search: {
        provider: 'local',
        options: {
          detailedView: true,
        },
      },

      editLink: {
        pattern: 'https://github.com/ahimsarijalu/mockops/edit/main/docs/:path',
        text: 'Edit this page on GitHub',
      },

      socialLinks: [{ icon: 'github', link: 'https://github.com/ahimsarijalu/mockops' }],

      footer: {
        message: 'Documentation for MockOps — generated from the source repository.',
        copyright: 'MockOps · built with VitePress',
      },

      lastUpdatedText: 'Last updated',

      docFooter: {
        prev: 'Previous page',
        next: 'Next page',
      },
    },

    markdown: {
      theme: { light: 'github-light', dark: 'github-dark' },
      lineNumbers: false,
    },

    mermaid: {
      theme: 'neutral',
    },
  }),
)
