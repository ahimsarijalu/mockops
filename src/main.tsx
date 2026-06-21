import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { queryClient } from '@/app/query-client'
import { ThemeProvider } from '@/app/theme-provider'
import { GlobalErrorBoundary } from '@/app/error-boundary'
import {
  RouteErrorComponent,
  RoutePendingComponent,
  RouteNotFoundComponent,
} from '@/app/router-fallbacks'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: RouteErrorComponent,
  defaultPendingComponent: RoutePendingComponent,
  defaultNotFoundComponent: RouteNotFoundComponent,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
