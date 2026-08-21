import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { WireMockClient } from './wiremock-client'
import type { ServerConfig } from '@/features/servers/types/server'

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

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())

describe('WireMockClient.mappings', () => {
  it('lists mappings and validates the response shape', async () => {
    mswServer.use(
      http.get(`${BASE_URL}/__admin/mappings`, () =>
        HttpResponse.json({
          mappings: [{ id: 'a', request: { method: 'GET', url: '/x' }, response: { status: 200 } }],
          meta: { total: 1 },
        }),
      ),
    )
    const client = new WireMockClient(server)
    const result = await client.mappings.list()
    expect(result.mappings).toHaveLength(1)
    expect(result.mappings[0].id).toBe('a')
  })

  it('preserves unknown fields on a mapping via the catchall schema', async () => {
    mswServer.use(
      http.get(`${BASE_URL}/__admin/mappings/abc`, () =>
        HttpResponse.json({
          id: 'abc',
          request: { method: 'GET', url: '/x' },
          response: { status: 200 },
          someFutureWireMockField: { nested: true },
        }),
      ),
    )
    const client = new WireMockClient(server)
    const mapping = await client.mappings.get('abc')
    expect((mapping as Record<string, unknown>).someFutureWireMockField).toEqual({ nested: true })
  })

  it('encodes the mapping id in create/update/delete URLs', async () => {
    let deletedPath: string | undefined
    mswServer.use(
      http.delete(`${BASE_URL}/__admin/mappings/:id`, ({ params }) => {
        deletedPath = params.id as string
        return new HttpResponse(null, { status: 200 })
      }),
    )
    const client = new WireMockClient(server)
    await client.mappings.remove('with space')
    expect(deletedPath).toBe('with space')
  })

  it('posts to the import endpoint with a mappings envelope', async () => {
    let body: unknown
    mswServer.use(
      http.post(`${BASE_URL}/__admin/mappings/import`, async ({ request }) => {
        body = await request.json()
        return new HttpResponse(null, { status: 200 })
      }),
    )
    const client = new WireMockClient(server)
    await client.mappings.importMappings([
      { request: { method: 'GET', url: '/y' }, response: { status: 200 } },
    ])
    expect(body).toEqual({
      mappings: [{ request: { method: 'GET', url: '/y' }, response: { status: 200 } }],
    })
  })
})

describe('WireMockClient.files', () => {
  it('URL-encodes nested file paths', async () => {
    let requestedPath: string | undefined
    mswServer.use(
      http.get(`${BASE_URL}/__admin/files/*`, ({ request }) => {
        requestedPath = new URL(request.url).pathname
        return HttpResponse.text('file contents')
      }),
    )
    const client = new WireMockClient(server)
    const content = await client.files.get('sub dir/data file.json')
    expect(requestedPath).toBe('/__admin/files/sub%20dir/data%20file.json')
    expect(content).toBe('file contents')
  })
})

describe('WireMockClient.requests', () => {
  it('parses near-misses-for-request responses', async () => {
    mswServer.use(
      http.post(`${BASE_URL}/__admin/near-misses/request`, () =>
        HttpResponse.json({
          nearMisses: [
            {
              request: { url: '/orders', method: 'GET' },
              matchResult: { distance: 0.2 },
            },
          ],
        }),
      ),
    )
    const client = new WireMockClient(server)
    const nearMisses = await client.requests.findNearMissesFor({
      url: '/orders',
      method: 'GET',
    })
    expect(nearMisses).toHaveLength(1)
    expect(nearMisses[0].matchResult?.distance).toBe(0.2)
  })
})

describe('WireMockClient error normalization', () => {
  it('surfaces a network error via the http-client interceptor', async () => {
    mswServer.use(http.get(`${BASE_URL}/__admin/health`, () => HttpResponse.error()))
    const client = new WireMockClient(server)
    await expect(client.system.health()).rejects.toMatchObject({ code: 'network' })
  })

  it('surfaces a 500 as an http ApiError with status', async () => {
    mswServer.use(
      http.get(`${BASE_URL}/__admin/version`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )
    const client = new WireMockClient(server)
    await expect(client.system.version()).rejects.toMatchObject({ code: 'http', status: 500 })
  })
})
