import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.code === 'http' &&
          error.status &&
          error.status < 500
        ) {
          return false
        }
        return failureCount < 2
      },
      staleTime: 10_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
