import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

// Standard VitePress theme, unmodified apart from the brand color overrides
// in custom.css (matched to MockOps' own logo mark — docs/public/favicon.svg).
// Mermaid diagram support is registered automatically by the
// `withMermaid()` wrapper in docs/.vitepress/config.ts; no theme changes are
// needed for it.
export default {
  extends: DefaultTheme,
} satisfies Theme
