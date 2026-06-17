import axios, { type AxiosInstance } from 'axios'
import type { ServerConfig } from '@/features/servers/types/server'

export class ApiError extends Error {
  status?: number
  code: 'network' | 'timeout' | 'http' | 'parse' | 'unknown'

  constructor(message: string, code: ApiError['code'], status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/**
 * WireMock surfaces filesystem failures (e.g. a read-only or unwritable
 * mappings/__files directory) as raw Java exception messages. Translate the
 * common ones into something actionable, while keeping the original detail.
 */
export function describeWireMockError(rawMessage: string): string {
  if (/(AccessDeniedException|FileSystemException|ReadOnlyFileSystemException)/.test(rawMessage)) {
    return `WireMock couldn't write to its storage directory (permission denied). Check that the WireMock server has write access to its mappings/__files directory, or disable "Persistent" before saving. (${rawMessage})`
  }
  return rawMessage
}

export function createHttpClient(server: ServerConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: server.baseUrl.replace(/\/+$/, ''),
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  if (server.authType === 'basic' && server.username) {
    instance.defaults.auth = {
      username: server.username,
      password: server.password ?? '',
    }
  } else if (server.authType === 'bearer' && server.token) {
    instance.defaults.headers.common.Authorization = `Bearer ${server.token}`
  }

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new ApiError('Request timed out', 'timeout'))
        }
        if (!error.response) {
          return Promise.reject(
            new ApiError(
              'Unable to reach WireMock server. Check the URL and that the server is running.',
              'network',
            ),
          )
        }
        return Promise.reject(
          new ApiError(
            describeWireMockError(error.response.data?.message ?? error.message),
            'http',
            error.response.status,
          ),
        )
      }
      return Promise.reject(new ApiError('Unexpected error', 'unknown'))
    },
  )

  return instance
}
