import { useEffect } from 'react'
import { useUiStore } from '@/shared/stores/ui-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = (resolved: 'light' | 'dark') => {
      root.classList.toggle('dark', resolved === 'dark')
    }

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      apply(media.matches ? 'dark' : 'light')
      const listener = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }

    apply(theme)
    return undefined
  }, [theme])

  return <>{children}</>
}
