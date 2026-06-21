import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { AlertTriangleIcon, FileQuestionIcon, Loader2Icon } from 'lucide-react'
import { Button, buttonVariants } from '@/shared/components/ui/button'

/**
 * Rendered when a route (or a query thrown to it) errors. Scoped to the route
 * outlet, so the app shell/navigation stays intact. "Try again" resets both the
 * router and the query error boundary so a retried fetch can actually recover.
 */
export function RouteErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorReset = useQueryErrorResetBoundary()

  const handleRetry = () => {
    queryErrorReset.reset()
    reset()
    void router.invalidate()
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/50 p-12 text-center">
      <AlertTriangleIcon className="size-10 text-destructive" />
      <div>
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
      </div>
      <Button onClick={handleRetry}>Try again</Button>
    </div>
  )
}

export function RoutePendingComponent() {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      <Loader2Icon className="size-6 animate-spin" />
    </div>
  )
}

export function RouteNotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border p-12 text-center">
      <FileQuestionIcon className="size-10 text-muted-foreground" />
      <div>
        <p className="font-medium">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Link to="/" className={buttonVariants()}>
        Back to dashboard
      </Link>
    </div>
  )
}
