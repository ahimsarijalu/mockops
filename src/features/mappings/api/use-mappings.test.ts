import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useBulkDeleteMappings } from './use-mappings'
import type { ServerConfig } from '@/features/servers/types/server'
import type { StubMapping } from '@/shared/types/wiremock'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))

const BASE_URL = 'http://wiremock.test'
const server: ServerConfig = {
  id: 'srv-1',
  name: 'Test',
  baseUrl: BASE_URL,
  environment: 'local',
  authType: 'none',
  createdAt: new Date().toISOString(),
}

const mswServer = setupServer()
beforeEach(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  mswServer.resetHandlers()
  mswServer.close()
})

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    QueryClientProvider({ client: queryClient, children })
}

describe('useBulkDeleteMappings', () => {
  it('reports partial success when some deletes fail', async () => {
    mswServer.use(
      http.delete(`${BASE_URL}/__admin/mappings/:id`, ({ params }) => {
        if (params.id === 'bad') {
          return new HttpResponse(null, { status: 500 })
        }
        return new HttpResponse(null, { status: 200 })
      }),
    )

    const { result } = renderHook(() => useBulkDeleteMappings(server), { wrapper: wrapper() })

    const mappings: StubMapping[] = [
      { id: 'good-1', request: {}, response: {} },
      { id: 'bad', request: {}, response: {} },
      { id: 'good-2', request: {}, response: {} },
    ]

    result.current.mutate(mappings)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.succeeded.map((m) => m.id)).toEqual(['good-1', 'good-2'])
    expect(result.current.data?.failed.map(({ mapping }) => mapping.id)).toEqual(['bad'])
  })

  it('reports full success when every delete succeeds', async () => {
    mswServer.use(
      http.delete(
        `${BASE_URL}/__admin/mappings/:id`,
        () => new HttpResponse(null, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useBulkDeleteMappings(server), { wrapper: wrapper() })

    const mappings: StubMapping[] = [
      { id: 'a', request: {}, response: {} },
      { id: 'b', request: {}, response: {} },
    ]

    result.current.mutate(mappings)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.failed).toEqual([])
    expect(result.current.data?.succeeded).toHaveLength(2)
  })
})
